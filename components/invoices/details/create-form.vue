<script setup lang="ts">
import type { InvoiceStatus } from '~/types';

const { formState, isLoading } = useInvoiceCreate()
const { suppliers } = useSuppliers()
const { openModal: openCreateModal, formState: createFormState } = useSupplierCreate()

const invoiceStatus = ref<{ label: string, value: InvoiceStatus, icon: string, class: string }[]>([
    { label: 'Payée', value: 'paid', icon: 'i-lucide-check-circle', class: 'text-green-500' },
    { label: 'Validée', value: 'validated', icon: 'i-lucide-check', class: 'text-blue-500' }
])

const onCreateSupplier = (newSupplierName: string) => {
    console.log('Creating new supplier:', newSupplierName)
    createFormState.name = newSupplierName || ''
    openCreateModal.value = true
}
</script>

<template>
    <LazySuppliersAddModal />
    <UForm class="space-y-4" :state="formState" :disabled="isLoading" :loading="isLoading">
        <UFormField label="Fournisseur">
            <UInputMenu v-model="formState.supplier_id" :items="suppliers" class="w-full" value-key="id" create-item
                label-key="name" @create="onCreateSupplier" placeholder="Sélectionner un fournisseur">
            </UInputMenu>
        </UFormField>
        <UFormField label="Commentaire">
            <UInput v-model="formState.comment" placeholder="Ajouter un commentaire..." class="w-full" />
        </UFormField>
        <UFormField label="Nom de la facture">
            <UInput v-model="formState.name" class="w-full" />
        </UFormField>
        <UFormField label="Date d'échéance">
            <UInput v-model="formState.due_date" type="date" class="w-full" />
        </UFormField>
        <UFormField label="Statut">
            <USelect v-model="formState.status" :items="invoiceStatus" placeholder="Status de la facture"
                class="w-full" />
        </UFormField>
        <UFormField label="Montant TVA">
            <UInput v-model="formState.taxe_amount" icon="i-lucide-euro" class="w-full" />
        </UFormField>
        <UFormField label="Montant TTC">
            <UInput v-model="formState.amount" icon="i-lucide-euro" class="w-full" />
        </UFormField>
    </UForm>
</template>