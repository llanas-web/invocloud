<script setup lang="ts">
import { upperFirst } from 'scule'
import type { TableColumn } from '@nuxt/ui'
import { LazyInvoicesDeleteModal, LazyInvoicesSendModal, UBadge, NuxtLink } from '#components'
import { getPaginationRowModel, type Row } from '@tanstack/table-core'
import { useInvoicesSend } from '~/composables/invoices/send'
import { useInvoicesDelete } from '~/composables/invoices/delete'
import { useInvoicesTableList } from '~/composables/invoices/table-list'


const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UCheckbox = resolveComponent('UCheckbox')

const table = useTemplateRef('table')

const { acceptedInvoices, pending } = useInvoices()
const { statusFilter, rangeFilter, filteredInvoices } = useInvoicesTableList()
const { updateInvoice } = useInvoices()
const { open: isSendModalOpen, selectedInvoices: listInvoicesToSend } = useInvoicesSend()
const { open: isDeleteModalOpen, selectedInvoices: listInvoicesToDelete } = useInvoicesDelete()
declare type Invoice = NonNullable<(typeof acceptedInvoices)['value']>[number];

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
                listInvoicesToSend.value = [row.original.id]
                isSendModalOpen.value = true
            }
        },
        {
            type: 'separator'
        },
        {
            label: 'Voir la facture',
            onSelect() {
                return navigateTo(`/app/invoices/${row.original.id}`)
            },
            icon: 'i-lucide-eye',

        },
        {
            type: 'separator'
        },
        {
            label: 'Changer le statut',
            icon: 'i-lucide-pencil',
            children: [
                {
                    label: 'Marquer comme payé',
                    icon: 'i-lucide-check',
                    iconColor: 'success',
                    onSelect() {
                        updateInvoice(row.original.id, {
                            status: 'paid'
                        })
                    }
                },
                {
                    label: 'Marquer comme en erreur',
                    icon: 'i-lucide-x',
                    onSelect() {
                        updateInvoice(row.original.id, {
                            status: 'error'
                        })
                    }
                }
            ]
        },
        {
            type: 'separator'
        },
        {
            label: 'Supprimer facture',
            icon: 'i-lucide-trash',
            color: 'error',
            onSelect() {
                listInvoicesToDelete.value = [row.original.id]
                isDeleteModalOpen.value = true
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
        accessorKey: 'number',
        header: 'Numéro de facture',
        cell: ({ row }) => {
            return h('div', { class: 'flex items-center gap-3' }, [
                h(NuxtLink, { class: 'font-medium text-highlighted hover:underline', to: `/app/invoices/${row.original.id}` }, row.original.invoice_number ?? ''),
            ])
        }
    },
    {
        accessorKey: 'supplier',
        header: 'Fournisseur',
        cell: ({ row, table }) => {
            return h('div', { class: 'flex items-center gap-3' }, [
                h('div', undefined, [
                    h('p', { class: 'font-medium text-highlighted' }, row.original.supplier_name),
                ])
            ])
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
        accessorKey: 'status',
        header: 'Status',
        filterFn: (row, columnId, value) => {
            if (value === 'all') return true
            if (value === 'error' && row.original.overdue) return true
            return row.original.status === value
        },
        cell: ({ row }) => {
            const statusColors = {
                pending: 'warning' as const,
                sent: 'error' as const,
                validated: 'warning' as const,
                paid: 'success' as const,
                error: 'error' as const,
            }
            const color = statusColors[row.original.status as keyof typeof statusColors]
            if (row.original.overdue) {
                return h(UBadge, { class: 'capitalize', variant: 'subtle', color: 'error' }, () =>
                    'En retard'
                )
            }
            return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () => {
                switch (row.original.status) {
                    case 'pending':
                        return 'En attente'
                    case 'sent':
                        return 'Envoyé'
                    case 'validated':
                        return 'En cours'
                    case 'paid':
                        return 'Payée'
                    case 'error':
                        return 'Erreur'
                }
            })
        }
    },
    {
        accessorKey: 'created_at',
        header: ({ column }) => {
            const isSorted = column.getIsSorted()

            return h(UButton, {
                variant: 'ghost',
                label: 'Date de réception',
                icon: isSorted
                    ? isSorted === 'asc'
                        ? 'i-lucide-arrow-up-narrow-wide'
                        : 'i-lucide-arrow-down-wide-narrow'
                    : 'i-lucide-arrow-up-down',
                class: '-mx-2.5',
                onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
            })
        },
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
        accessorKey: 'due_date',
        header: ({ column }) => {
            const isSorted = column.getIsSorted()

            return h(UButton, {
                variant: 'ghost',
                label: 'Date d\'échéance',
                icon: isSorted
                    ? isSorted === 'asc'
                        ? 'i-lucide-arrow-up-narrow-wide'
                        : 'i-lucide-arrow-down-wide-narrow'
                    : 'i-lucide-arrow-up-down',
                class: '-mx-2.5',
                onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
            })
        },
        cell: ({ row }) => {
            if (row.getValue('due_date') === null || row.getValue('due_date') === '') {
                return h('div', { class: 'text-muted' }, '')
            }
            const date = new Date(row.getValue('due_date'))
            return h('div', { class: 'text-muted' }, date.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }))
        }
    },

    {
        accessorKey: 'paid_at',
        header: ({ column }) => {
            const isSorted = column.getIsSorted()
            return h(UButton, {
                variant: 'ghost',
                label: 'Date de paiement',
                icon: isSorted
                    ? isSorted === 'asc'
                        ? 'i-lucide-arrow-up-narrow-wide'
                        : 'i-lucide-arrow-down-wide-narrow'
                    : 'i-lucide-arrow-up-down',
                class: '-mx-2.5',
                onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
            })
        },
        cell: ({ row }) => {
            if (row.getValue('paid_at') === null || row.getValue('paid_at') === '') {
                return h('div', { class: 'text-muted' }, '')
            }
            const date = new Date(row.getValue('paid_at'))
            return h('div', { class: 'text-muted' }, date.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }))
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

const openSendModal = () => {
    listInvoicesToSend.value = table.value!.tableApi?.getFilteredSelectedRowModel().rows.map(r => r.original.id) ?? []
    isSendModalOpen.value = true
}

const openDeleteModal = () => {
    listInvoicesToDelete.value = table.value!.tableApi?.getFilteredSelectedRowModel().rows.map(r => r.original.id) ?? []
    isDeleteModalOpen.value = true
}
</script>

<template>
    <LazyInvoicesSendModal />
    <LazyInvoicesDeleteModal />
    <div class="flex flex-wrap items-center justify-between gap-1.5">
        <div class="flex flex-wrap items-center gap-1.5">

            <UButton :disabled="!table?.tableApi?.getFilteredSelectedRowModel().rows.length" label="Envoyer"
                color="primary" variant="subtle" icon="i-lucide-send" @click="openSendModal" :ui="{
                    label: 'hidden md:block',
                }">
                <template #trailing>
                    <UKbd>
                        {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length }}
                    </UKbd>
                </template>
            </UButton>
            <UButton :disabled="!table?.tableApi?.getFilteredSelectedRowModel().rows.length" label="Supprimer"
                color="error" variant="subtle" icon="i-lucide-trash" @click="openDeleteModal" :ui="{
                    label: 'hidden md:block',
                }">
                <template #trailing>
                    <UKbd>
                        {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length }}
                    </UKbd>
                </template>
            </UButton>
        </div>
        <div class="flex flex-wrap items-center gap-1.5">

            <USelect v-model="statusFilter" :items="[
                { label: 'Tout', value: 'all' },
                { label: 'En cours', value: 'validated' },
                { label: 'Payé', value: 'paid' },
                { label: 'En retard', value: 'error' }
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
                <UButton label="Colonnes" color="neutral" variant="outline" trailing-icon="i-lucide-settings-2" />
            </UDropdownMenu>
        </div>
    </div>
    <UTable ref="table" v-model:column-visibility="columnVisibility" v-model:row-selection="rowSelection"
        v-model:pagination="pagination" :pagination-options="{
            getPaginationRowModel: getPaginationRowModel()
        }" class="shrink-0" :data="filteredInvoices" :columns="columns" :loading="pending" :ui="{
            base: 'table-fixed border-separate border-spacing-0',
            thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
            tbody: '[&>tr]:last:[&>td]:border-b-0',
            th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
            td: 'border-b border-default'
        }" />

    <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
        <div class="text-sm text-muted">
            {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} de
            {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} ligne(s) sélectionnée(s).
        </div>

        <div class="flex items-center gap-1.5">
            <UPagination :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
                :items-per-page="table?.tableApi?.getState().pagination.pageSize"
                :total="table?.tableApi?.getFilteredRowModel().rows.length"
                @update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)" />
        </div>
    </div>
</template>