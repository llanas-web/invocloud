<script setup lang="ts">
import type { LazyInvoicesUploadAcceptSideover } from '#components'
import type { TableColumn } from '@nuxt/ui'

const { pendingInvoices, updateInvoice } = useInvoices()

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')

const acceptSideover = useTemplateRef<typeof LazyInvoicesUploadAcceptSideover>('acceptSideover')

// Use the type of the items inside the pendingInvoices ref's value
type PendingInvoices = NonNullable<(typeof pendingInvoices)['value']>[number]

const columns: TableColumn<PendingInvoices>[] = [
    {
        accessorKey: 'supplier',
        header: 'Fournisseur',
        cell: ({ row, table }) => {
            return h('div', { class: 'flex items-center gap-3' }, [
                h('div', undefined, [
                    h('p', { class: 'font-medium text-highlighted' }, row.original.supplier.name),
                ])
            ])
        }
    },
    {
        accessorKey: 'comment',
        header: 'Commentaire',
        cell: ({ row }) => {
            return h('span', { class: 'font-medium text-highlighted' },
                row.getValue('comment')
            )
        }
    },
    {
        accessorKey: 'created_at',
        header: 'Envoyé le',
        cell: ({ row }) => {
            return new Date(row.getValue('created_at')).toLocaleString('fr-FR', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            })
        }
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const color = {
                paid: 'success' as const,
                failed: 'error' as const,
                refunded: 'neutral' as const
            }[row.getValue('status') as string]

            return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () =>
                row.getValue('status')
            )
        }
    },
    // generate a "validate invoice" column with a button
    {
        accessorKey: 'validate',
        header: '',
        cell: ({ row }) => {
            return h('div', { class: 'flex justify-end items-center gap-3' }, [
                h(UButton, {
                    color: 'success',
                    icon: 'i-lucide-check',
                    size: 'sm',
                    class: 'cursor-pointer',
                    label: 'Accepter',
                    onClick: () => {
                        return navigateTo(`/app/invoices/${row.original.id}`)
                    }
                }),
            ])
        }
    },
]

</script>

<template>
    <InvoicesUploadAcceptSideover ref="acceptSideover" />
    <UTable v-if="pendingInvoices.length > 0" ref="table" class="shrink-0" :data="pendingInvoices" :columns="columns"
        :ui="{
            base: 'table-fixed border-separate border-spacing-0',
            thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
            tbody: '[&>tr]:last:[&>td]:border-b-0',
            th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
            td: 'border-b border-default'
        }" />

</template>