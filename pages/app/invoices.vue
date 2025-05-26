<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { upperFirst } from 'scule'
import { getPaginationRowModel, type Row } from '@tanstack/table-core'
import { InvoicesSendModal, LazyInvoicesSendModal, UBadge } from '#components'

definePageMeta({
    layout: 'app'
})

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UCheckbox = resolveComponent('UCheckbox')

const toast = useToast()
const table = useTemplateRef('table')
const { invoices, pending, updateInvoice, deleteInvoices } = useInvoices()
declare type Invoice = NonNullable<(typeof invoices)['value']>[number];

const acceptedStatus = ['validated', 'paid', 'error']
const acceptedInvoices = computed(() => invoices.value?.filter(i => acceptedStatus.includes(i.status)) || [])

const columnVisibility = ref()
const rowSelection = ref({})


function getRowItems(row: Row<Invoice>) {
    return [
        {
            type: 'label',
            label: 'Actions'
        },
        {
            label: 'Envoyer par e-mail',
            icon: 'i-lucide-mail',
            onSelect() {
            }
        },
        {
            type: 'separator'
        },
        {
            label: 'View invoice details',
            icon: 'i-lucide-eye'
        },
        {
            type: 'separator'
        },
        {
            label: 'Set as paid',
            icon: 'i-lucide-check',
            async onSelect() {
                await updateInvoice(row.original.id, {
                    status: 'paid'
                })
            }
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
        accessorKey: 'name',
        header: 'Nom',
        cell: ({ row }) => {
            return h('div', { class: 'flex items-center gap-3' }, [
                h('p', { class: 'font-medium text-highlighted' }, row.original.name ?? ''),
            ])
        }
    },
    {
        accessorKey: 'supplier',
        header: 'Fournisseur',
        cell: ({ row, table }) => {
            return h('div', { class: 'flex items-center gap-3' }, [
                h('div', undefined, [
                    h('p', { class: 'font-medium text-highlighted' }, row.original.supplier.name),
                    h('p', { class: '' }, `${row.original.supplier.email}`)
                ])
            ])
        }
    },
    {
        accessorKey: 'status',
        header: 'Status',
        filterFn: 'equals',
        cell: ({ row }) => {
            const color = {
                pending: 'warning' as const,
                sent: 'error' as const,
                validated: 'warning' as const,
                paid: 'success' as const,
                error: 'error' as const,
            }[row.original.status]

            return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () =>
                row.original.status
            )
        }
    },
    {
        accessorKey: 'created_at',
        header: 'Date de création',
        cell: ({ row }) => {
            const date = new Date(row.getValue('created_at'))
            return h('div', { class: 'text-muted' }, date.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }))
        }
    },
    {
        accessorKey: 'amount',
        header: () => h('div', { class: 'text-right' }, 'Montant'),
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
            <InvoicesUploadTable />
            <div class="flex flex-wrap items-center justify-between gap-1.5">
                <div class="flex flex-wrap items-center gap-1.5">
                    <InvoicesDeleteModal :count="table?.tableApi?.getFilteredSelectedRowModel().rows.length">
                        <UButton v-if="table?.tableApi?.getFilteredSelectedRowModel().rows.length" label="Delete"
                            color="error" variant="subtle" icon="i-lucide-trash">
                            <template #trailing>
                                <UKbd>
                                    {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length }}
                                </UKbd>
                            </template>
                        </UButton>
                    </InvoicesDeleteModal>

                    <InvoicesSendModal ref="sendModal"
                        :invoices="table?.tableApi?.getFilteredSelectedRowModel().rows.map(r => r.original.id) ?? []">
                        <UButton v-if="table?.tableApi?.getFilteredSelectedRowModel().rows.length" label="Envoyer"
                            color="primary" variant="subtle" icon="i-lucide-send">
                            <template #trailing>
                                <UKbd>
                                    {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length }}
                                </UKbd>
                            </template>
                        </UButton>
                    </InvoicesSendModal>

                    <USelect v-model="statusFilter" :items="[
                        { label: 'Tout', value: 'all' },
                        { label: 'En attente', value: 'validated' },
                        { label: 'Payé', value: 'paid' },
                        { label: 'En erreur', value: 'error' }
                    ]" :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
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
                        <UButton label="Colonnes" color="neutral" variant="outline"
                            trailing-icon="i-lucide-settings-2" />
                    </UDropdownMenu>
                </div>
            </div>

            <UTable ref="table" v-model:column-visibility="columnVisibility" v-model:row-selection="rowSelection"
                v-model:pagination="pagination" :pagination-options="{
                    getPaginationRowModel: getPaginationRowModel()
                }" class="shrink-0" :data="acceptedInvoices" :columns="columns" :loading="pending" :ui="{
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
