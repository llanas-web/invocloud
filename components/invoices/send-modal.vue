<script setup lang="ts">
    import * as z from 'zod'
    import type { FormSubmitEvent } from '@nuxt/ui'

    const { sendInvoice } = useInvoices()
    const toast = useToast()

    const props = withDefaults(defineProps<{
        invoicesId?: string[]
    }>(), {
        invoicesId: () => []
    })

    const _invoicesId = ref<string[]>(props.invoicesId)

    const open = ref(false)

    const schema = z.object({
        email: z.string().email()
    })

    type Schema = z.output<typeof schema>

    const state = reactive<Partial<Schema>>({
        email: undefined
    })

    async function onSubmit(event: FormSubmitEvent<Schema>) {
        const { email } = event.data
        const response = await sendInvoice(_invoicesId.value, email)
        if (!response) {
            toast.add({ title: 'Error', description: 'Failed to send invoice', color: 'error' })
            return
        }
        toast.add({ title: 'Success', description: `Invoice sent to ${email}`, color: 'success' })
        state.email = undefined
        open.value = false
    }


    function showSendInvoiceModal(_listInvoicesIdToSend: string[]) {
        _invoicesId.value = _listInvoicesIdToSend
        state.email = undefined
        open.value = true
    }

    defineExpose({
        showSendInvoiceModal
    })
</script>

<template>
    <UModal v-model:open="open" title="Nouvelle facture" description="Add a new customer to the database">
        <slot />
        <template #body>
            <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
                <UFormField label="Email du destinataire" name="email">
                    <UInput v-model="state.email" placeholder="Email du destinataire" class="w-full" />
                </UFormField>
                <div class="flex justify-end gap-2 mt-8">
                    <UButton label="Cancel" color="neutral" variant="subtle" @click="open = false" />
                    <UButton label="Create" color="primary" variant="solid" type="submit" />
                </div>
            </UForm>
        </template>
    </UModal>
</template>
