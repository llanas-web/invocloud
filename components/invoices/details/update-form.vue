<script setup lang="ts">
import type { InvoiceStatus } from '~/types';
import { format } from 'date-fns'

const { invoice, isLoading } = useInvoiceDetails()
const { formState, isDisabled } = useInvoiceUpdate()

const invoiceStatus = ref<{ label: string, value: InvoiceStatus, icon: string, class: string }[]>([
    { label: 'Payée', value: 'paid', icon: 'i-lucide-check-circle', class: 'text-green-500' },
    { label: 'Validée', value: 'validated', icon: 'i-lucide-check', class: 'text-blue-500' }
])
</script>

<template>
    <UForm class="space-y-4" :state="formState" :disabled="isDisabled" :loading="isLoading">
        <UFormField label="Fournisseur">
            <USkeleton v-if="!invoice" class="h-8" />
            <UInput v-else :model-value="invoice.supplier.name" icon="i-lucide-user" class="w-full" disabled />
        </UFormField>
        <UFormField label="Commentaire">
            <USkeleton v-if="!invoice" class="h-8" />
            <UInput v-else v-model="invoice.comment" placeholder="Ajouter un commentaire..." disabled class="w-full" />
        </UFormField>
        <UFormField label="Date de création">
            <USkeleton v-if="!invoice" class="h-8" />
            <UInput v-else :model-value="invoice.created_at" class="w-full" disabled />
        </UFormField>
        <USeparator class="my-6" />
        <UFormField label="Numéro de facture">
            <USkeleton v-if="!invoice" class="h-8" />
            <UInput v-else v-model="formState.invoice_number" class="w-full" />
        </UFormField>
        <UFormField label="Nom de la facture">
            <USkeleton v-if="!invoice" class="h-8" />
            <UInput v-else v-model="formState.name" class="w-full" />
        </UFormField>
        <div class="flex flex-row justify-between items-center">
            <UFormField label="Date d'échéance">
                <USkeleton v-if="!invoice" class="h-8" />
                <UInput v-else v-model="formState.due_date" type="date" class="w-full" />
            </UFormField>
            <UFormField label="Date de paiement">
                <USkeleton v-if="!invoice" class="h-8" />
                <UInput v-else v-model="formState.paid_at" type="date" class="w-full" />
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