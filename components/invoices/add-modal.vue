<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const supabaseUser = useSupabaseUser();
const { createInvoice } = useInvoices()
const { stakeholders, getStakeholders } = useStakeholders()

await getStakeholders()

const schema = z.object({
    stakeholderId: z.string().refine((value) => {
        if (!value) return false
        const stakeholder = stakeholders.value.find((s) => s.id === value)
        return !!stakeholder
    }, 'Please select a customer'),
    amount: z.number().min(0, 'Must be greater than 0'),
})
const open = ref(false)

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
    stakeholderId: undefined,
    amount: undefined
})

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
    const { stakeholderId, amount } = event.data
    const newInvoice = await createInvoice({
        stakeholder_id: stakeholderId,
        amount: amount,
        user_id: supabaseUser.value!.id
    })
    if (!newInvoice) {
        toast.add({ title: 'Error', description: 'Failed to create invoice', color: 'error' })
        return
    }
    toast.add({ title: 'Success', description: `New customer ${newInvoice.id} added`, color: 'success' })
    open.value = false
    state.stakeholderId = undefined
    state.amount = undefined
}
</script>

<template>
    <UModal v-model:open="open" title="New Customer" description="Add a new customer to the database">
        <UButton label="New customer" icon="i-lucide-plus" />

        <template #body>
            <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
                <UFormField label="Name" placeholder="John Doe" name="name">
                    <UInputMenu v-model="state.stakeholderId" :items="stakeholders" class="w-full" value-key="id"
                        label-key="name">
                    </UInputMenu>
                </UFormField>
                <UFormField label="Montant" placeholder="Montant TTC" name="amount">
                    <UInputNumber v-model="state.amount" :stepSnapping="false" :format-options="{
                        style: 'currency',
                        currency: 'EUR',
                        currencyDisplay: 'code',
                        currencySign: 'accounting'
                    }" />
                </UFormField>
                <div class="flex justify-end gap-2">
                    <UButton label="Cancel" color="neutral" variant="subtle" @click="open = false" />
                    <UButton label="Create" color="primary" variant="solid" type="submit" />
                </div>
            </UForm>
        </template>
    </UModal>
</template>
