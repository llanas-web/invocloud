<script setup lang="ts">
    import { InvoicesListStats } from '#components';


    const { openModal } = useUploadWizard()

    definePageMeta({
        layout: 'app',
    })

    const { supplierFilter } = useInvoices();
    const { suppliers } = useSuppliers();

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
                    <UButton label="Nouvelle facture" variant="subtle" icon="i-lucide-plus" @click="onNewInvoice" :ui="{
                        label: 'hidden md:block',
                    }" />
                    <UButton label="Envoyer des factures" trailing-icon="i-lucide-send" @click="openModal" :ui="{
                        label: 'hidden md:block',
                    }" />
                </template>
            </UDashboardNavbar>

            <UDashboardToolbar>
                <template #left>
                    <!-- NOTE: The `-ms-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
                    <HomeDateRangePicker class="-ms-1" />
                </template>
                <template #right>
                    <UInputMenu v-model="supplierFilter" :items="suppliers" class="w-full hidden md:block"
                        variant="outline" value-key="id" label-key="name" placeholder="Recherche fournisseur" multiple
                        delete-icon="i-lucide-x" :ui="{
                            content: 'min-w-fit',
                            base: 'space-x-1'
                        }">
                    </UInputMenu>
                </template>
            </UDashboardToolbar>
            <UDashboardToolbar :ui="{
                root: ' block md:hidden p-2'
            }">
                <UInputMenu v-model="supplierFilter" :items="suppliers" class="w-full" variant="outline" value-key="id"
                    label-key="name" placeholder="Recherche fournisseur" multiple delete-icon="i-lucide-x" :ui="{
                        content: 'min-w-fit'
                    }">
                </UInputMenu>
            </UDashboardToolbar>
        </template>

        <template #body>
            <InvoicesListStats />
            <InvoicesUploadTable />
            <InvoicesListTable />
        </template>
    </UDashboardPanel>
</template>
