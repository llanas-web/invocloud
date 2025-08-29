<script setup lang="ts">
import type { InvoiceStatus } from '~/types';
import { format } from 'date-fns'

const { invoice, isLoading: loadingDetails } = useInvoiceDetails()
const { formRef, formState, formStateSchema, isLoading: loadingUpdate, onSubmit } = useInvoiceUpdate()

const invoiceStatus = ref<{ label: string, value: InvoiceStatus, icon: string, class: string }[]>([
    { label: 'Validée', value: 'validated', icon: 'i-lucide-check', class: 'text-blue-500' },
    { label: 'Payée', value: 'paid', icon: 'i-lucide-euro', class: 'text-green-500' },
])

const updateInvoiceFormRef = useTemplateRef('updateInvoiceFormRef')
onMounted(() => {
    formRef.value = updateInvoiceFormRef.value
})

const isLoading = computed(() => loadingDetails.value || loadingUpdate.value)
</script>

<template>
    <UForm @submit="onSubmit" ref="updateInvoiceFormRef" class="space-y-4" :state="formState" :disabled="isLoading"
        :loading="isLoading" :schema="formStateSchema">
        <UFormField name="created_at" label="Date de facture" required
            class="flex flex-row justify-between items-center gap-4">
            <CommonFormDatePicker v-model="formState.created_at" label="Date de la facture" />
        </UFormField>
        <UFormField label="Fournisseur">
            <USkeleton v-if="!invoice" class="h-8" />
            <UInput v-else :model-value="invoice.supplier.name" icon="i-lucide-user" class="w-full" disabled />
        </UFormField>
        <UFormField label="Commentaire">
            <USkeleton v-if="!invoice" class="h-8" />
            <UInput v-else v-model="formState.comment" placeholder="Ajouter un commentaire..." class="w-full" />
        </UFormField>
        <UFormField label="Numéro de facture">
            <USkeleton v-if="!invoice" class="h-8" />
            <UInput v-else v-model="formState.invoice_number" class="w-full" />
        </UFormField>
        <UFormField label="Nom de la facture">
            <USkeleton v-if="!invoice" class="h-8" />
            <UInput v-else v-model="formState.name" class="w-full" />
        </UFormField>
        <div class="flex flex-row justify-between items-center gap-4">
            <UFormField name="due_date" label="Date d'échéance" class="flex-1" required>
                <USkeleton v-if="!invoice" class="h-8" />
                <CommonFormDatePicker v-else v-model="formState.due_date" label="Date d'échéance" />
            </UFormField>
            <UFormField name="paid_at" label="Date de paiement" class="flex-1">
                <USkeleton v-if="!invoice" class="h-8" />
                <CommonFormDatePicker v-else v-model="formState.paid_at" label="Date de paiement" />
            </UFormField>
        </div>
        <UFormField label="Statut">
            <USkeleton v-if="!invoice" class="h-8" />
            <USelect v-else v-model="formState.status" :items="invoiceStatus" placeholder="Status de la facture"
                class="w-full" />
        </UFormField>
        <UFormField label="Montant TVA">
            <USkeleton v-if="!invoice" class="h-8" />
            <UInput v-else v-model="formState.taxe_amount" icon="i-lucide-euro" class="w-full" />
        </UFormField>
        <UFormField label="Montant TTC">
            <USkeleton v-if="!invoice" class="h-8" />
            <UInput v-else v-model="formState.amount" icon="i-lucide-euro" class="w-full" />
        </UFormField>
    </UForm>
</template>