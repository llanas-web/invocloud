<script setup lang="ts">
import type { UForm } from '#components';
import type { InvoiceStatus } from '~/types';

const { formRef, formState, isLoading, formStateSchema, onSubmit } = useInvoiceCreate()
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

const createInvoiceFormRef = useTemplateRef('createInvoiceFormRef')
onMounted(() => {
    formRef.value = createInvoiceFormRef.value
})
</script>

<template>
    <LazySuppliersAddModal />
    <UForm @submit="onSubmit" ref="createInvoiceFormRef" class="space-y-4" :state="formState" :disabled="isLoading"
        :loading="isLoading" :schema="formStateSchema" :validate-on="['input', 'change', 'blur']">
        <UFormField name="created_at" label="Date de facture" required
            class="flex flex-row justify-between items-center gap-4">
            <CommonFormDatePicker v-model="formState.created_at" label="Date de la facture" />
        </UFormField>
        <UFormField name="supplier_id" label="Fournisseur" required>
            <UInputMenu v-model="formState.supplier_id" :items="suppliers" class="w-full" value-key="id" create-item
                label-key="name" @create="onCreateSupplier" placeholder="Sélectionner un fournisseur">
            </UInputMenu>
        </UFormField>
        <UFormField name="comment" label="Commentaire">
            <UInput v-model="formState.comment" placeholder="Ajouter un commentaire..." class="w-full" />
        </UFormField>
        <UFormField name="invoice_number" label="Numéro de facture" required>
            <UInput v-model="formState.invoice_number" class="w-full" />
        </UFormField>
        <UFormField name="name" label="Nom de la facture">
            <UInput v-model="formState.name" class="w-full" />
        </UFormField>
        <div class="flex flex-row justify-between items-center gap-4">
            <UFormField name="due_date" label="Date d'échéance" class="flex-1" required>
                <CommonFormDatePicker v-model="formState.due_date" label="Date d'échéance" @change="() => {
                    formRef?.validate({ name: 'due_date' })
                }" @blur="() => formRef?.validate({ name: 'due_date' })" />
            </UFormField>
            <UFormField name="paid_at" label="Date de paiement" class="flex-1">
                <CommonFormDatePicker v-model="formState.paid_at" label="Date de paiement" />
            </UFormField>
        </div>
        <UFormField name="status" label="Statut" required>
            <USelect v-model="formState.status" :items="invoiceStatus" placeholder="Status de la facture"
                class="w-full" />
        </UFormField>
        <UFormField name="taxe_amount" label="Montant TVA" required>
            <UInput v-model="formState.taxe_amount" icon="i-lucide-euro" class="w-full" type="number" />
        </UFormField>
        <UFormField name="amount" label="Montant TTC" required>
            <UInput v-model="formState.amount" icon="i-lucide-euro" class="w-full" type="number" />
        </UFormField>
    </UForm>
</template>