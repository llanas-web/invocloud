<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const supabaseUser = useSupabaseUser();
const { createInvoice } = useInvoices()
const { suppliers } = useSuppliers()

const schema = z.object({
    supplierId: z.string().refine((value) => {
        if (!value) return false
        const supplier = suppliers.value.find((s) => s.id === value)
        return !!supplier
    }, 'Please select a supplier'),
    amount: z.number().min(0, 'Must be greater than 0'),
    name: z.string(),
    invoiceFile: z.instanceof(File)
})
const open = ref(false)
const isMenuOpen = ref(false)

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
    supplierId: undefined,
    amount: 0,
    name: undefined,
    invoiceFile: undefined
})

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
    const { supplierId, amount, invoiceFile, name } = event.data
    const newInvoice = await createInvoice({
        supplier_id: supplierId,
        amount: amount,
        name: name,
    },
        invoiceFile)
    if (!newInvoice) {
        toast.add({ title: 'Error', description: 'Erreurs lors de l\'ajout de la facture', color: 'error' })
        return
    }
    toast.add({ title: 'Success', description: `La facture a été ajoutée avec succès`, color: 'success' })
    open.value = false
    state.supplierId = undefined
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
    <UModal v-model:open="open" title="Nouvelle facture" description="Uploader une nouvelle facture">
        <UButton label="Nouvelle facture" icon="i-lucide-plus" />

        <template #body>
            <UForm ref="form" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit"
                @error="(e) => console.error(e)">
                <UFormField label="Client" placeholder="John Doe" name="supplierId">
                    <UInputMenu v-model="state.supplierId" :items="suppliers" class="w-full" value-key="id"
                        label-key="name" v-model:open="isMenuOpen" @focus="isMenuOpen = true">
                    </UInputMenu>
                </UFormField>
                <UFormField label="Montant" placeholder="Montant TTC" name="amount">
                    <UInputNumber v-model="state.amount" :stepSnapping="false" class="w-full" />
                </UFormField>
                <UFormField label="Fichier facture" name="invoiceFile">
                    <UInput type="file" @change="onFileChange" class="w-full" />
                </UFormField>
                <UFormField label="Nom de la facture" name="name">
                    <UInput v-model="state.name" placeholder="File name" class="w-full" />
                </UFormField>
                <div class="flex justify-end gap-2 mt-8">
                    <UButton label="Annuler" color="neutral" variant="subtle" @click="open = false" />
                    <UButton label="Ajouter" color="primary" variant="solid" type="submit" />
                </div>
            </UForm>
        </template>
    </UModal>
</template>
