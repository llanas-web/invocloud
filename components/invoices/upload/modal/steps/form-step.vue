<script setup lang="ts">
import * as z from 'zod'

const toast = useToast()
const { isLoading, formState } = useInvoiceUpload()

const fileFormSchema = z.object({
    sendorEmail: z.string().email('Invalid email address'),
    recipientEmail: z.string().email('Invalid email address'),
    comment: z.string().optional(),
    invoiceFile: z.instanceof(File)
})

const onFileChange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    formState.invoiceFile = file
}
</script>

<template>
    <UForm ref="stepFileForm" :schema="fileFormSchema" :state="formState" class="space-y-4 mt-8">
        <UFormField label="Envoyer à" placeholder="Jean Dupont" name="recipientEmail">
            <UInput v-model="formState.recipientEmail" placeholder="Email du destinataire" class="w-full"
                :disabled="isLoading" :autofocus="true" />
        </UFormField>
        <UFormField label="Votre email" placeholder="Votre email" name="senderEmail">
            <UInput v-model="formState.senderEmail" placeholder="Votre email" class="w-full" :disabled="isLoading" />
        </UFormField>
        <UFormField label="Fichier" name="invoiceFile">
            <UInput type="file" placeholder="Choisir une facture" @change="onFileChange" class="w-full"
                :disabled="isLoading" />
        </UFormField>
        <UFormField label="Commentaire" name="comment">
            <UInput v-model="formState.comment" placeholder="Commentaire" class="w-full" :disabled="isLoading" />
        </UFormField>
    </UForm>
</template>