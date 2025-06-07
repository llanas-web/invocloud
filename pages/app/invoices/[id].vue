<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'
import type { InvoiceStatus } from '~/types'

definePageMeta({
    layout: 'app'
})

const route = useRoute()
const { invoices, updateInvoice } = useInvoices()

const invoiceStatus = ref<{ label: string, value: InvoiceStatus, icon: string, class: string }[]>([
    { label: 'Payée', value: 'paid', icon: 'i-lucide-check-circle', class: 'text-green-500' },
    { label: 'En attente', value: 'pending', icon: 'i-lucide-clock', class: 'text-yellow-500' },
    { label: 'Validée', value: 'validated', icon: 'i-lucide-check', class: 'text-blue-500' }
])
const items = ref<BreadcrumbItem[]>([
    {
        label: 'Factures',
        icon: 'i-lucide-files',
        to: '/app/invoices'
    },
    {
        label: `Détails Facture`,
        icon: 'i-lucide-file-text',
        to: `/app/invoices/${route.params.id}`
    }
])

const formInvoice = reactive<{
    status: '' | InvoiceStatus,
    amount: number | null
}>({
    status: '',
    amount: null
})
const invoice = computed(() => invoices.value.find(i => i.id === route.params.id))
const isLoading = ref(false)
const isDisabled = computed(() => !invoice.value || invoice.value.status === 'paid')

watch(invoice, (newInvoice) => {
    if (newInvoice) {
        Object.assign(formInvoice, JSON.parse(JSON.stringify(newInvoice)))
    }
}, { immediate: true })

const handleSave = async () => {
    if (!formInvoice || !invoice.value) return

    isLoading.value = true
    const updatedInvoice = await updateInvoice(invoice.value.id, {
        status: formInvoice.status !== '' ? formInvoice.status : invoice.value.status,
        amount: formInvoice.amount !== null ? formInvoice.amount : invoice.value.amount
    })
    isLoading.value = false
    if (!updatedInvoice) {
        console.error("Failed to save invoice")
        // Optional: show error toast
        return
    }

    // Update local invoices list manually, or re-fetch if needed
    Object.assign(invoice.value!, formInvoice) // sync back to global store
}

const isDirty = computed(() => {
    if (!invoice.value) return false
    return (
        invoice.value.status !== formInvoice.status ||
        invoice.value.amount !== formInvoice.amount
    )
})

</script>
<template>
    <UDashboardPanel :id="`invoices-${route.params.id}`" :default-size="25" :min-size="20" :max-size="100" resizable>
        <template #header>
            <UDashboardNavbar :ui="{ right: 'gap-3' }">
                <template #leading>
                    <UDashboardSidebarCollapse />
                    <UBreadcrumb :items="items" class="hidden md:flex" />
                </template>
                <template #left>
                </template>
                <template #right>
                </template>
            </UDashboardNavbar>
        </template>
        <template #body>
            <div class="p-2">
                <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
                    <UIcon name="i-lucide-file-text" class="text-primary" /> Détails de la facture
                </h2>
                <UForm class="space-y-4" :state="formInvoice ?? {}" :disabled="isDisabled" :loading="isLoading">
                    <UFormField label="Fournisseur">
                        <USkeleton v-if="!invoice" class="w-full" />
                        <UInput v-else :model-value="invoice.supplier?.name" icon="i-lucide-user" class="w-full"
                            disabled />
                    </UFormField>
                    <UFormField label="Commentaire">
                        <USkeleton v-if="!invoice" class="h-4" />
                        <UInput v-else v-model="invoice.comment" placeholder="Ajouter un commentaire..." disabled
                            class="w-full" />
                    </UFormField>
                    <UFormField label="Date de création">
                        <USkeleton v-if="!invoice" class="h-4" />
                        <UInput v-else :model-value="invoice.created_at" class="w-full" disabled />
                    </UFormField>
                    <USeparator class="my-6" />
                    <UFormField label="Statut">
                        <USkeleton v-if="!formInvoice" class="h-4" />
                        <USelect v-else v-model="formInvoice.status" :items="invoiceStatus" placeholder="Chargement..."
                            class="w-full" />
                    </UFormField>
                    <UFormField label="Montant">
                        <USkeleton v-if="!formInvoice" class="h-4" />
                        <UInput v-else v-model="formInvoice.amount" icon="i-lucide-euro" class="w-full" />
                    </UFormField>
                </UForm>
            </div>
            <div class="flex justify-end p-4 mt-auto space-x-4">
                <UButton label="Annuler" color="neutral" variant="subtle" @click="$emit('cancel')" />
                <UButton label="Sauvegarder" color="success" @click="handleSave" :disabled="!isDisabled && !isDirty" />
            </div>
        </template>
    </UDashboardPanel>
    <template v-if="invoice">
        <CommonInvoiceViewer :invoice="invoice" />
    </template>

</template>