<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { upperFirst } from 'scule'
import { getPaginationRowModel, type Row } from '@tanstack/table-core'
import type { Supplier } from '~~/types'

definePageMeta({
    layout: 'app'
})

const { supplier, openModal } = useSupplierEdit();

const UAvatar = resolveComponent('UAvatar')
const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UCheckbox = resolveComponent('UCheckbox')

const toast = useToast()
const table = useTemplateRef('table')
const { suppliers, pending, deleteSuppliers } = useSuppliers()
const { openModal: openCreateModal } = useSupplierCreate()

const rowSelection = ref()

function getRowItems(row: Row<Supplier>) {
    return [
        {
            type: 'label',
            label: 'Actions'
        },
        {
            label: 'Modifier le fournisseur',
            icon: 'i-lucide-edit',
            onSelect() {
                supplier.value = row.original
                openModal.value = true
            }
        },
        {
            type: 'separator'
        },
        {
            label: 'Supprimer le fournisseur',
            icon: 'i-lucide-trash',
            color: 'error',
            async onSelect() {
                await deleteSuppliers([row.original.id])
                toast.add({
                    title: 'Fournisseur supprimé',
                    description: 'Le fournisseur a été supprimé.'
                })
            }
        }
    ]
}

const columns: TableColumn<Supplier>[] = [
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
        accessorKey: 'Fournisseur',
        header: 'Fournisseur',
        cell: ({ row }) => {
            return h('div', { class: 'flex items-center gap-3' }, [
                h('div', undefined, [
                    h('p', { class: 'font-medium text-highlighted' }, row.original.name),
                    h('p', { class: '' }, `@${row.original.name}`)
                ])
            ])
        }
    },
    {
        accessorKey: 'emails',
        header: 'Emails',
        cell: ({ row }) => {
            return h('span', { class: 'text-muted' }, row.original.emails.join(', '))
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

const onNewSupplier = () => {
    openCreateModal.value = true
}
</script>

<template>
    <UDashboardPanel id="customers">
        <template #header>
            <UDashboardNavbar title="Fournisseurs">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>

                <template #right>
                    <UButton label="Nouveau fournisseur" icon="i-lucide-plus" @click="onNewSupplier" />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <LazySuppliersAddModal />
            <div class="flex flex-wrap items-center justify-between gap-1.5">
                <!-- <UInput :model-value="(table?.tableApi?.getColumn('emails')?.getFilterValue() as string)"
                    class="max-w-sm" icon="i-lucide-search" placeholder="Filter emails..."
                    @update:model-value="table?.tableApi?.getColumn('emails')?.setFilterValue($event)" /> -->

                <div class="flex flex-wrap items-center gap-1.5">
                    <SuppliersDeleteModal :count="table?.tableApi?.getFilteredSelectedRowModel().rows.length">
                        <UButton v-if="table?.tableApi?.getFilteredSelectedRowModel().rows.length" label="Delete"
                            color="error" variant="subtle" icon="i-lucide-trash"
                            @click="() => deleteSuppliers(table!.tableApi!.getFilteredSelectedRowModel().rows.map((row) => row.original.id))">
                            <template #trailing>
                                <UKbd>
                                    {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length }}
                                </UKbd>
                            </template>
                        </UButton>
                    </SuppliersDeleteModal>
                    <SuppliersEditModal />
                </div>
            </div>

            <UTable ref="table" v-model:row-selection="rowSelection" v-model:pagination="pagination"
                :pagination-options="{
                    getPaginationRowModel: getPaginationRowModel()
                }" class="shrink-0" :data="suppliers ?? undefined" :columns="columns" :loading="pending" :ui="{
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
    </UDashboardPanel>
</template>
