<script setup lang="ts">
definePageMeta({
    layout: 'app'
})

const onNewInvoice = () => {
    navigateTo('/app/invoices/new')
}
</script>

<template>
    <UDashboardPanel id="invoices">
        <template #header>
            <UDashboardNavbar title="Factures">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>

                <template #right>
                    <UButton label="Nouvelle facture" icon="i-lucide-plus" @click="onNewInvoice" />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <InvoicesUploadTable />
            <InvoicesListTable />
        </template>
    </UDashboardPanel>
</template>
