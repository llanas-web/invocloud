<script setup lang="ts">
    import type { BreadcrumbItem } from '@nuxt/ui'
    import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'

    definePageMeta({
        layout: 'app'
    })

    const { invoice, pending: loadingDetails, invoiceId } = useInvoiceDetails()
    const { formRef, pending: loadingUpdate } = useInvoiceUpdate()

    const items = ref<BreadcrumbItem[]>([
        {
            label: 'Factures',
            icon: 'i-lucide-files',
            to: '/app'
        },
        {
            label: `Détails Facture`,
            icon: 'i-lucide-file-text',
            to: `/app/invoices/${invoice.value?.id}`
        }
    ])

    const breakpoints = useBreakpoints(breakpointsTailwind)
    const isMobile = breakpoints.smaller('lg')
    const isFormOpen = ref(false)

    const isLoading = computed(() => loadingDetails.value || loadingUpdate.value)
</script>
<template>
    <UDashboardPanel :id="`invoices-${invoiceId}`" :default-size="25" :min-size="20" :max-size="100" resizable>
        <template #header>
            <UDashboardNavbar :ui="{ right: 'gap-3' }">
                <template #leading>
                    <UDashboardSidebarCollapse />
                    <UBreadcrumb :items="items" class="hidden md:flex" />
                </template>
                <template #left>
                </template>
                <template #right>
                    <UButton v-if="isMobile" label="Voir la facture" variant="ghost" size="md"
                        trailingIcon="i-lucide-eye" @click="isFormOpen = true" />
                </template>
            </UDashboardNavbar>
        </template>
        <template #body>
            <div class="p-2">
                <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
                    <UIcon name="i-lucide-file-text" class="text-primary" /> Détails de la facture
                </h2>
                <InvoicesDetailsUpdateForm />
            </div>
            <div class="flex justify-end p-4 mt-auto space-x-4">
                <UButton label="Annuler" color="neutral" variant="subtle" :disabled="!!isLoading"
                    @click="navigateTo('/app')" />
                <UButton label="Sauvegarder" color="success" :loading="isLoading" @click="formRef?.submit()"
                    :disabled="isLoading" />
            </div>
        </template>
    </UDashboardPanel>
    <template v-if="invoice">
        <USlideover v-if="isMobile" v-model:open="isFormOpen">
            <template #body>
                <InvoicesDetailsInvoiceViewer :invoice="invoice" />
            </template>
        </USlideover>
        <InvoicesDetailsInvoiceViewer v-else :invoice="invoice" />
    </template>



</template>