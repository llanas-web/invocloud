<script setup lang="ts">
    import type { UForm } from '#components';
    import { CreateInvoiceSchema } from '~/types/schemas/forms/invoices.schema';
    import { InvoiceStatus } from '~~/shared/domain/invoice/invoice.model';

    const { formRef, formState, pending, onSubmit } = useInvoiceCreate()
    const { suppliers } = useSuppliers()
    const { openModal: openCreateModal, formState: createFormState } = useSupplierCreate()

    const invoiceStatus = ref<{ label: string, value: InvoiceStatus, icon: string, class: string }[]>([
        { label: 'Payée', value: InvoiceStatus.PAID, icon: 'i-lucide-check-circle', class: 'text-green-500' },
        { label: 'Validée', value: InvoiceStatus.VALIDATED, icon: 'i-lucide-check', class: 'text-blue-500' }
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
    <UForm @submit="onSubmit" ref="createInvoiceFormRef" class="space-y-4" :state="formState" :disabled="pending"
        :loading="pending" :schema="CreateInvoiceSchema" :validate-on="['input', 'change', 'blur']">
        <UFormField name="createdAt" label="Date de facture" required
            class="flex flex-row justify-between items-center gap-4">
            <CommonFormDatePicker v-model="formState.emitDate" label="Date de la facture" />
        </UFormField>
        <UFormField name="supplierId" label="Fournisseur" required>
            <UInputMenu v-model="formState.supplierId" :items="suppliers" class="w-full" value-key="id" create-item
                label-key="name" @create="onCreateSupplier" placeholder="Sélectionner un fournisseur">
            </UInputMenu>
        </UFormField>
        <UFormField name="comment" label="Commentaire">
            <UInput v-model="formState.comment" placeholder="Ajouter un commentaire..." class="w-full" />
        </UFormField>
        <UFormField name="invoiceNumber" label="Numéro de facture" required>
            <UInput v-model="formState.invoiceNumber" class="w-full" />
        </UFormField>
        <UFormField name="name" label="Nom de la facture">
            <UInput v-model="formState.name" class="w-full" />
        </UFormField>
        <div class="flex flex-row justify-between items-center gap-4">
            <UFormField name="due_date" label="Date d'échéance" class="flex-1" required>
                <CommonFormDatePicker v-model="formState.dueDate" label="Date d'échéance" @change="() => {
                    formRef?.validate({ name: 'due_date' })
                }" @blur="() => formRef?.validate({ name: 'due_date' })" />
            </UFormField>
            <UFormField name="paidAt" label="Date de paiement" class="flex-1">
                <CommonFormDatePicker v-model="formState.paidAt" label="Date de paiement" />
            </UFormField>
        </div>
        <UFormField name="status" label="Statut" required>
            <USelect v-model="formState.status" :items="invoiceStatus" placeholder="Status de la facture"
                class="w-full" />
        </UFormField>
        <UFormField name="amount" label="Montant TTC" required>
            <CommonFormNumberInput v-model.trim="formState.amount as string | undefined" icon="i-lucide-euro"
                class="w-full" :format-on-blur="true" :fraction-digits="2" :allow-negative="false" type="string"
                inputmode="decimal" spellcheck="false" />
        </UFormField>
    </UForm>
</template>