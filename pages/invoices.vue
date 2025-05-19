<script setup lang="ts">
    import type { TableColumn } from '@nuxt/ui'
    import { upperFirst } from 'scule'
    import { getPaginationRowModel, type Row } from '@tanstack/table-core'
    import type { Invoice } from '~/types'
    import { UBadge } from '#components'

    const UButton = resolveComponent('UButton')
    const UDropdownMenu = resolveComponent('UDropdownMenu')
    const UCheckbox = resolveComponent('UCheckbox')

    const toast = useToast()
    const table = useTemplateRef('table')
    const { invoices, invoicesLoading, getInvoices, deleteInvoices } = useInvoices()

    const columnFilters = ref([{
        id: 'email',
        value: ''
    }])
    const columnVisibility = ref()
    const rowSelection = ref({ 1: true })

    await getInvoices()


    function getRowItems(row: Row<Invoice>) {
        return [
            {
                type: 'label',
                label: 'Actions'
            },
            {
                label: 'Copy customer ID',
                icon: 'i-lucide-copy',
                onSelect() {
                    navigator.clipboard.writeText(row.original.id.toString())
                    toast.add({
                        title: 'Copied to clipboard',
                        description: 'Customer ID copied to clipboard'
                    })
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'View customer details',
                icon: 'i-lucide-list'
            },
            {
                label: 'View customer payments',
                icon: 'i-lucide-wallet'
            },
            {
                type: 'separator'
            },
            {
                label: 'Supprimer facture',
                icon: 'i-lucide-trash',
                color: 'error',
                async onSelect() {
                    await deleteInvoices([row.original.id])
                    toast.add({
                        title: 'Facture supprimée',
                        description: 'La facture a été supprimée avec succès',
                    })
                }
            }
        ]
    }

    const columns: TableColumn<Invoice>[] = [
        {
            id: 'select',
            header: ({ table }) =>
                h(UCheckbox, {
                    'modelValue': table.getIsSomePageRowsSelected()
                        ? 'indeterminate'
                        : table.getIsAllPageRowsSelected(),
                    'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
                        table.toggleAllPageRowsSelected(!!value),
                    'ariaLabel': 'Select all'
                }),
            cell: ({ row }) =>
                h(UCheckbox, {
                    'modelValue': row.getIsSelected(),
                    'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
                    'ariaLabel': 'Select row'
                })
        },
        {
            accessorKey: 'Id',
            header: 'Id',
            cell: ({ row }) => {
                return h('div', { class: 'flex items-center gap-3' }, [
                    h('p', { class: 'font-medium text-highlighted' }, row.original.id),
                ])
            }
        },
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => {
                return h('div', { class: 'flex items-center gap-3' }, [
                    h('p', { class: 'font-medium text-highlighted' }, row.original.name),
                ])
            }
        },
        {
            accessorKey: 'status',
            header: 'Status',
            filterFn: 'equals',
            cell: ({ row }) => {
                const color = {
                    paid: 'success' as const,
                    sent: 'error' as const,
                    pending: 'warning' as const
                }[row.original.status]

                return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () =>
                    row.original.status
                )
            }
        },
        {
            accessorKey: 'amount',
            header: () => h('div', { class: 'text-right' }, 'Amount'),
            cell: ({ row }) => {
                const amount = Number.parseFloat(row.getValue('amount'))

                const formatted = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'EUR'
                }).format(amount)

                return h('div', { class: 'text-right font-medium' }, formatted)
            }
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                return h(
                    'div',
                    { class: 'text-right' },
                    h(
                        UDropdownMenu,
                        {
                            content: {
                                align: 'end'
                            },
                            items: getRowItems(row)
                        },
                        () =>
                            h(UButton, {
                                icon: 'i-lucide-ellipsis-vertical',
                                color: 'neutral',
                                variant: 'ghost',
                                class: 'ml-auto'
                            })
                    )
                )
            }
        }
    ]

    const statusFilter = ref('all')

    watch(() => statusFilter.value, (newVal) => {
        if (!table?.value?.tableApi) return

        const statusColumn = table.value.tableApi.getColumn('status')
        if (!statusColumn) return

        if (newVal === 'all') {
            statusColumn.setFilterValue(undefined)
        } else {
            statusColumn.setFilterValue(newVal)
        }
    })

    const pagination = ref({
        pageIndex: 0,
        pageSize: 10
    })
</script>

<template>
    <UDashboardPanel id="invoices">
        <template #header>
            <UDashboardNavbar title="Factures">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>

                <template #right>
                    <InvoicesAddModal />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <div class="flex flex-wrap items-center justify-between gap-1.5">

                <div class="flex flex-wrap items-center gap-1.5">
                    <InvoicesDeleteModal :count="table?.tableApi?.getFilteredSelectedRowModel().rows.length">
                        <UButton v-if="table?.tableApi?.getFilteredSelectedRowModel().rows.length" label="Delete"
                            color="error" variant="subtle" icon="i-lucide-trash"
                            @click="() => deleteInvoices(table!.tableApi!.getFilteredSelectedRowModel().rows.map((row) => row.original.id))">
                            <template #trailing>
                                <UKbd>
                                    {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length }}
                                </UKbd>
                            </template>
                        </UButton>
                    </InvoicesDeleteModal>

                    <USelect v-model="statusFilter" :items="[
                        { label: 'All', value: 'all' },
                        { label: 'Subscribed', value: 'subscribed' },
                        { label: 'Unsubscribed', value: 'unsubscribed' },
                        { label: 'Bounced', value: 'bounced' }
                    ]"
                        :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
                        placeholder="Filter status" class="min-w-28" />
                    <UDropdownMenu :items="table?.tableApi
                        ?.getAllColumns()
                        .filter((column) => column.getCanHide())
                        .map((column) => ({
                            label: upperFirst(column.id),
                            type: 'checkbox' as const,
                            checked: column.getIsVisible(),
                            onUpdateChecked(checked: boolean) {
                                table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
                            },
                            onSelect(e?: Event) {
                                e?.preventDefault()
                            }
                        }))
                        " :content="{ align: 'end' }">
                        <UButton label="Display" color="neutral" variant="outline"
                            trailing-icon="i-lucide-settings-2" />
                    </UDropdownMenu>
                </div>
            </div>

            <UTable ref="table" v-model:column-filters="columnFilters" v-model:column-visibility="columnVisibility"
                v-model:row-selection="rowSelection" v-model:pagination="pagination" :pagination-options="{
                    getPaginationRowModel: getPaginationRowModel()
                }" class="shrink-0" :data="invoices" :columns="columns" :loading="invoicesLoading" :ui="{
                    base: 'table-fixed border-separate border-spacing-0',
                    thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
                    tbody: '[&>tr]:last:[&>td]:border-b-0',
                    th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
                    td: 'border-b border-default'
                }" />

            <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
                <div class="text-sm text-muted">
                    {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} of
                    {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} row(s) selected.
                </div>

                <div class="flex items-center gap-1.5">
                    <UPagination :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
                        :items-per-page="table?.tableApi?.getState().pagination.pageSize"
                        :total="table?.tableApi?.getFilteredRowModel().rows.length"
                        @update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)" />
                </div>
            </div>
        </template>
    </UDashboardPanel>
</template>
