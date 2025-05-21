<script setup lang="ts">
import * as z from 'zod'
import type { Form, FormSubmitEvent } from '@nuxt/ui'

const stepFileForm = useTemplateRef('stepFileForm')
const stepConfirmForm = useTemplateRef('stepConfirmForm')
const stepper = useTemplateRef('stepper')
const toast = useToast()

const open = ref(false)
const stepIndex = ref(0)
const isLoading = ref(false)
const sharedInvoiceId = ref<string | null>(null)

const stepItems = ref([
    {
        slot: 'form' as const,
        label: 'Send Invoices',
        title: 'Envoyer des factures',
        description: 'Envoyez des fichiers de factures en toute sécurité aux parties prenantes',
        icon: 'i-lucide-send'
    },
    {
        slot: 'confirm' as const,
        label: 'Confirmer l\'email',
        title: 'Confirmer l\'email',
        description: 'Confirmez votre adresse e-mail',
        icon: 'i-lucide-check'
    }
])

const fileFormSchema = z.object({
    sendorEmail: z.string().email('Invalid email address'),
    recipientEmail: z.string().email('Invalid email address'),
    comment: z.string().optional(),
    invoiceFile: z.instanceof(File)
})

type FileFormSchema = z.output<typeof fileFormSchema>

const fileFormState = reactive<Partial<FileFormSchema>>({
    sendorEmail: undefined,
    recipientEmail: undefined,
    comment: undefined,
    invoiceFile: undefined
})

async function submitFileForm(event: FormSubmitEvent<FileFormSchema>) {
    const { sendorEmail, recipientEmail, comment, invoiceFile } = fileFormState
    await useSupabaseClient().auth.signInAnonymously({
        options: {
            data: {
                email: sendorEmail
            }
        }
    });
    try {
        const { invoice_id, code, expires_at, success } = await $fetch('/api/request-upload', {
            method: 'POST',
            body: {
                sendorEmail,
                recipientEmail,
                comment,
                invoiceFile
            }
        })
        if (success !== true) {
            toast.add({ title: 'Error', description: 'Failed to request upload', color: 'error' })
            isLoading.value = false
            return
        }
        console.dir({ invoice_id, code, expires_at });
        sharedInvoiceId.value = invoice_id
        stepper.value?.next()
    } catch (error) {
        console.error('Error uploading file:', error)
        toast.add({ title: 'Error', description: 'Failed to upload file', color: 'error' })
        isLoading.value = false
        return
    }
}

const confirmFormSchema = z.object({
    confirmToken: z.string().array().length(6, 'Invalid token'),
})

type ConfirmFormSchema = z.output<typeof confirmFormSchema>

const confirmFormState = reactive<Partial<ConfirmFormSchema>>({
    confirmToken: undefined,
})

async function submitConfirmForm(event: FormSubmitEvent<ConfirmFormSchema>) {
    const { confirmToken } = event.data
    try {
        const { fileName, url } = await $fetch('/api/upload-invoices', {
            method: 'POST',
            body: {
                invoiceId: sharedInvoiceId.value,
                token: confirmToken.join('')
            }
        })
        await $fetch(url, {
            method: 'PUT',
            body: fileFormState.invoiceFile!,
            headers: {
                'Content-Type': fileFormState.invoiceFile!.type
            }
        })
        toast.add({ title: 'Success', description: `File ${fileName} uploaded successfully`, color: 'success' })
        open.value = false
    } catch (error) {
        console.error('Error confirming upload:', error.message)
        toast.add({ title: 'Error', description: 'Failed to confirm upload', color: 'error' })
    }
}

const onFileChange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    fileFormState.invoiceFile = file
}

const onValidate = async () => {
    isLoading.value = true
    if (stepIndex.value === 0) {
        const form = stepFileForm.value
        if (!form) return
        const isValid = await form.validate()
        if (!isValid) {
            toast.add({ title: 'Error', description: 'Please fill all required fields', color: 'error' })
            return
        }
        await stepFileForm.value.submit();
        isLoading.value = true
    } else {
        const form = stepConfirmForm.value
        if (!form) return
        const isValid = await form.validate()
        if (!isValid) {
            toast.add({ title: 'Error', description: 'Please fill all required fields', color: 'error' })
            return
        }
        await stepConfirmForm.value.submit();
    }
    isLoading.value = false
}

const onPrev = () => {
    if (stepIndex.value === 0) {
        open.value = false
    } else {
        stepper.value?.prev()
    }
}
</script>

<template>
    <UModal v-model:open="open" title="Envoyer des factures"
        description="Envoyez des fichiers de factures en toute sécurité aux parties prenantes"
        :ui="{ footer: 'justify-end' }">
        <UButton label="Envoyer des factures" trailing-icon="i-lucide-send" size="xl" color="neutral"
            variant="subtle" />

        <template #body>
            <UStepper v-model="stepIndex" ref="stepper" :items="stepItems" size="sm">
                <template #form>
                    <UForm ref="stepFileForm" :schema="fileFormSchema" :state="fileFormState" class="space-y-4 mt-8"
                        @submit="submitFileForm">
                        <UFormField label="Envoyer à" placeholder="Jean Dupont" name="recipientEmail">
                            <UInput v-model="fileFormState.recipientEmail" placeholder="Email du destinataire"
                                class="w-full" :loading="isLoading" :autofocus="true" />
                        </UFormField>
                        <UFormField label="Votre email" placeholder="Votre email" name="sendorEmail">
                            <UInput v-model="fileFormState.sendorEmail" placeholder="Votre email" class="w-full"
                                :loading="isLoading" />
                        </UFormField>
                        <UFormField label="Fichier" name="invoiceFile">
                            <UInput type="file" placeholder="Choisir une facture" @change="onFileChange" class="w-full"
                                :loading="isLoading" />
                        </UFormField>
                        <UFormField label="Commentaire" name="comment">
                            <UInput v-model="fileFormState.comment" placeholder="Commentaire" class="w-full"
                                :loading="isLoading" />
                        </UFormField>
                    </UForm>
                </template>
                <template #confirm>
                    <UForm ref="stepConfirmForm" :schema="confirmFormSchema" :state="confirmFormState"
                        class="space-y-4 mt-8" @submit="submitConfirmForm">
                        <UFormField label="Code de confirmation" name="confirmToken"
                            class="w-full flex flex-col items-center justify-center">
                            <UPinInput type="text" :length="6" v-model="confirmFormState.confirmToken" class="w-full" />
                        </UFormField>
                    </UForm>
                </template>
            </UStepper>
        </template>
        <template #footer>
            <UButton label="Annuler" color="neutral" variant="subtle" @click="onPrev" :loading="isLoading" />
            <UButton label="Envoyer" color="primary" variant="solid" @click="onValidate" :loading="isLoading" />
        </template>
    </UModal>
</template>