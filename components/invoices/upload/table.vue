<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const supabaseClient = useSupabaseClient()
const { updatePendingInvoiceStatus } = useInvoices()

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')

const { data: pendingInvoices } = useAsyncData('pendingInvoices', async () => {
    const { data, error } = await supabaseClient
        .from('pending_invoices')
        .select(`
            *,
            stakeholder: stakeholders(
                email,
                name
            )
        `)
        .neq('status', 'validated')
        .neq('status', 'rejected')
        .order('created_at', { ascending: false })


    if (error) {
        console.error(error)
        return []
    }

    return data
}, {
    default: () => [],
})

// Use the type of the items inside the pendingInvoices ref's value
type PendingInvoices = NonNullable<(typeof pendingInvoices)['value']>[number]

const columns: TableColumn<PendingInvoices>[] = [
    {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => `#${row.getValue('id')}`
    },
    {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => {
            return new Date(row.getValue('date')).toLocaleString('en-US', {
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
    {
        accessorKey: 'stakeholder',
        header: 'Sendor',
        cell: ({ row, table }) => {
            return h('div', { class: 'flex items-center gap-3' }, [
                h('div', undefined, [
                    h('p', { class: 'font-medium text-highlighted' }, row.original.stakeholder.name),
                    h('p', { class: '' }, `@${row.original.stakeholder.email}`)
                ])
            ])
        }
    },
    // generate a "validate invoice" column with a button
    {
        accessorKey: 'validate',
        header: '',
        cell: ({ row }) => {
            return h('div', { class: 'flex items-center gap-3' }, [
                h(UButton, {
                    color: 'success',
                    icon: 'i-lucide-check',
                    size: 'sm',
                    class: 'cursor-pointer',
                    onClick: () => {
                        updatePendingInvoiceStatus(row.original.id, 'validated')
                    }
                }),
                h(UButton, {
                    color: 'error',
                    icon: 'i-lucide-x',
                    size: 'sm',
                    class: 'cursor-pointer',
                    onClick: () => {
                        updatePendingInvoiceStatus(row.original.id, 'rejected')
                    }
                })
            ])
        }
    },
]

</script>

<template>
    <UTable v-if="pendingInvoices.length > 0" ref="table" class="shrink-0" :data="pendingInvoices" :columns="columns"
        :ui="{
            base: 'table-fixed border-separate border-spacing-0',
            thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
            tbody: '[&>tr]:last:[&>td]:border-b-0',
            th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
            td: 'border-b border-default'
        }" />

</template>