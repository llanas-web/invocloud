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
    name: z.string(),
    invoiceFile: z.instanceof(File)
})
const open = ref(false)

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
    stakeholderId: undefined,
    amount: undefined,
    name: undefined,
    invoiceFile: undefined
})

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
    const { stakeholderId, amount, invoiceFile, name } = event.data
    const newInvoice = await createInvoice({
        stakeholder_id: stakeholderId,
        amount: amount,
        name: name,
        user_id: supabaseUser.value!.id
    },
        invoiceFile)
    if (!newInvoice) {
        toast.add({ title: 'Error', description: 'Failed to create invoice', color: 'error' })
        return
    }
    toast.add({ title: 'Success', description: `New customer ${newInvoice.id} added`, color: 'success' })
    open.value = false
    state.stakeholderId = undefined
    state.amount = undefined
}

const onFileChange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    state.invoiceFile = file
    state.name = file.name
}

</script>

<template>
    <UModal v-model:open="open" title="New Customer" description="Add a new customer to the database">
        <UButton label="New customer" icon="i-lucide-plus" />

        <template #body>
            <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
                <UFormField label="Customer" placeholder="John Doe" name="name">
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
                    }" class="w-full" />
                </UFormField>
                <UFormField label="File" name="invoiceFile">
                    <UInput type="file" @change="onFileChange" class="w-full" />
                </UFormField>
                <UFormField label="File name" name="name">
                    <UInput v-model="state.name" placeholder="File name" class="w-full" />
                </UFormField>
                <div class="flex justify-end gap-2 mt-8">
                    <UButton label="Cancel" color="neutral" variant="subtle" @click="open = false" />
                    <UButton label="Create" color="primary" variant="solid" type="submit" />
                </div>
            </UForm>
        </template>
    </UModal>
</template>
