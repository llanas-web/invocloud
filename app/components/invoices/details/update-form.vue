<script setup lang="ts">
    import { UpdateInvoiceFormSchema } from '~/types/schemas/forms/invoices.schema'
    import { InvoiceStatus } from '~~/shared/domain/invoice/invoice.model'

    const { invoice, pending: loadingDetails } = useInvoiceDetails()
    const { formRef, formState, pending: loadingUpdate, onSubmit } = useInvoiceUpdate()

    const invoiceStatus = ref<{ label: string, value: InvoiceStatus, icon: string, class: string }[]>([
        { label: 'Validée', value: InvoiceStatus.VALIDATED, icon: 'i-lucide-check', class: 'text-blue-500' },
        { label: 'Payée', value: InvoiceStatus.PAID, icon: 'i-lucide-euro', class: 'text-green-500' },
    ])

    const updateInvoiceFormRef = useTemplateRef('updateInvoiceFormRef')
    onMounted(() => {
        formRef.value = updateInvoiceFormRef.value
    })

    const isLoading = computed(() => loadingDetails.value || loadingUpdate.value)
</script>

<template>
    <UForm @submit="onSubmit" ref="updateInvoiceFormRef" class="space-y-4" :state="formState" :disabled="isLoading"
        :loading="isLoading" :schema="UpdateInvoiceFormSchema">
        <UFormField name="created_at" label="Date de facture" required
            class="flex flex-row justify-between items-center gap-4">
            <CommonFormDatePicker v-model="formState.emitDate" label="Date de la facture" />
        </UFormField>
        <UFormField label="Fournisseur">
            <USkeleton v-if="!invoice" class="h-8" />
            <UInput v-else :model-value="invoice.supplierName" icon="i-lucide-user" class="w-full" disabled />
        </UFormField>
        <UFormField label="Commentaire" name="comment">
            <USkeleton v-if="!invoice" class="h-8" />
            <UInput v-else v-model="formState.comment" name="comment" placeholder="Ajouter un commentaire..."
                class="w-full" />
        </UFormField>
        <UFormField name="invoice_number" label="Numéro de facture" required>
            <USkeleton v-if="!invoice" class="h-8" />
            <UInput v-else v-model="formState.invoiceNumber" name="invoice_number" class="w-full" />
        </UFormField>
        <UFormField label="Nom de la facture" name="name">
            <USkeleton v-if="!invoice" class="h-8" />
            <UInput v-else v-model="formState.name" name="name" class="w-full" />
        </UFormField>
        <div class="flex flex-row justify-between gap-4">
            <UFormField name="due_date" label="Date d'échéance" class="flex-1" required>
                <USkeleton v-if="!invoice" class="h-8" />
                <CommonFormDatePicker v-else v-model="formState.dueDate" label="Date d'échéance" />
            </UFormField>
            <UFormField name="paid_at" label="Date de paiement" class="flex-1">
                <USkeleton v-if="!invoice" class="h-8" />
                <CommonFormDatePicker v-else v-model="formState.paidAt" label="Date de paiement" />
            </UFormField>
        </div>
        <UFormField label="Statut" required name="status">
            <USkeleton v-if="!invoice" class="h-8" />
            <USelect v-else v-model="formState.status" name="status" :items="invoiceStatus"
                placeholder="Status de la facture" class="w-full" />
        </UFormField>
        <UFormField label="Montant TTC" name="amount" required>
            <USkeleton v-if="!invoice" class="h-8" />
            <CommonFormNumberInput v-model.trim="formState.amount" icon="i-lucide-euro" class="w-full"
                :format-on-blur="true" :fraction-digits="2" :allow-negative="false" type="string" inputmode="decimal"
                spellcheck="false" />
        </UFormField>
    </UForm>
</template>