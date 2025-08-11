<script setup lang="ts">
import { sub } from 'date-fns'
import type { Period, Range } from '~/types'

const { isNotificationsSlideoverOpen } = useDashboard()
const { openModal } = useInvoiceUpload()

definePageMeta({
    layout: 'app'
})

const items = [[{
    label: 'Envoyer une facture',
    icon: 'i-lucide-send',
    to: '/inbox'
}, {
    label: 'Ajouter une facture',
    icon: 'i-lucide-file-plus',
    to: '/customers'
},
{
    label: 'Ajouter un fournisseur',
    icon: 'i-lucide-user-plus',
    to: '/suppliers'
}]]

const range = shallowRef<Range>({
    start: sub(new Date(), { days: 14 }),
    end: new Date()
})
const period = ref<Period>('journalier')
const onNewInvoice = () => {
    navigateTo('/app/invoices/new')
}
</script>

<template>
    <UDashboardPanel id="Factures">
        <template #header>
            <UDashboardNavbar title="Factures" :ui="{ right: 'gap-3' }">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>

                <template #right>

                    <!-- <UTooltip text="Notifications" :shortcuts="['N']">
                        <UButton color="neutral" variant="ghost" square @click="isNotificationsSlideoverOpen = true">
                            <UChip color="error" inset>
                                <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
                            </UChip>
                        </UButton>
                    </UTooltip> -->

                    <!-- <UDropdownMenu :items="items">
                        <UButton icon="i-lucide-plus" size="md" class="rounded-full" />
                    </UDropdownMenu> -->
                    <UButton label="Nouvelle facture" variant="subtle" icon="i-lucide-plus" @click="onNewInvoice" />
                    <UButton label="Envoyer des factures" trailing-icon="i-lucide-send" @click="openModal" :ui="{
                        label: 'hidden md:block',
                    }" />
                </template>
            </UDashboardNavbar>

            <UDashboardToolbar>
                <template #left>
                    <!-- NOTE: The `-ms-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
                    <HomeDateRangePicker v-model="range" class="-ms-1" />
                    <HomePeriodSelect v-model="period" :range="range" />
                </template>
            </UDashboardToolbar>
        </template>

        <template #body>
            <InvoicesListInvoicesStats :period="period" :range="range" />
            <InvoicesUploadTable />
            <InvoicesListTable />
        </template>
    </UDashboardPanel>
</template>
