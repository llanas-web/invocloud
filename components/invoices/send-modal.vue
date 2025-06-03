<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const { invoices } = defineProps<{
    invoices: string[],
}>()
const emit = defineEmits<{ close: [boolean] }>()

const { sendInvoice } = useInvoices()

const schema = z.object({
    email: z.string().email()
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
    email: undefined
})

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
    const { email } = event.data
    const response = await sendInvoice(invoices, email)
    if (!response) {
        toast.add({ title: 'Error', description: 'Failed to send invoice', color: 'error' })
        return
    }
    toast.add({ title: 'Success', description: `Invoice sent to ${email}`, color: 'success' })
    state.email = undefined
}

</script>

<template>
    <UModal title="Nouvelle facture" description="Add a new customer to the database">
        <slot />
        <template #body>
            <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
                <UFormField label="Email du destinataire" name="email">
                    <UInput v-model="state.email" placeholder="Email du destinataire" class="w-full" />
                </UFormField>
                <div class="flex justify-end gap-2 mt-8">
                    <UButton label="Cancel" color="neutral" variant="subtle" @click="emit('close', false)" />
                    <UButton label="Create" color="primary" variant="solid" type="submit" />
                </div>
            </UForm>
        </template>
    </UModal>
</template>
