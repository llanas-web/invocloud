<script setup lang="ts">
    import type { TableColumn } from '@nuxt/ui'
    import { formatDate } from '~/utils/date'
    import { InvoiceStatus } from '~~/shared/domain/invoice/invoice.model'

    const pendingInvoiceStatus: InvoiceStatus[] = [InvoiceStatus.DRAFT, InvoiceStatus.OCR, InvoiceStatus.PENDING]

    const { invoices } = useInvoices()
    const { error: deleteInvoiceError, selectedInvoices, onSubmit } = useInvoicesDelete()

    const UBadge = resolveComponent('UBadge')
    const UButton = resolveComponent('UButton')
    const toast = useToast()

    const pendingInvoices = computed(() =>
        invoices.value.filter((invoice) => pendingInvoiceStatus.includes(invoice.status))
    )

    const columns: TableColumn<typeof invoices.value[0]>[] = [
        {
            accessorKey: 'supplier',
            header: 'Fournisseur',
            cell: ({ row, table }) => {
                return h('div', { class: 'flex items-center gap-3' }, [
                    h('div', undefined, [
                        h('p', { class: 'font-medium text-highlighted' }, row.original.supplierName),
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
                return formatDate(row.original.emitDate);
            }
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                return h(UBadge, { variant: 'subtle', color: 'neutral' }, () => {
                    switch (row.original.status) {
                        case 'draft':
                            return 'En attente de soumission';
                        case 'ocr':
                            return 'En cours de traitement OCR';
                        case 'pending':
                            return 'En attente de validation';
                        default:
                            return row.original.status;
                    }
                })
            }
        },
        {
            accessorKey: 'Valider',
            header: '',
            cell: ({ row }) => {
                return (row.original.status === 'pending') ? h('div', { class: 'flex justify-end items-center gap-3' }, [
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
                    h(UButton, {
                        color: 'error',
                        icon: 'i-lucide-x',
                        size: 'sm',
                        class: 'cursor-pointer',
                        label: 'Refuser',
                        onClick: async () => {
                            selectedInvoices.value = [row.original.id]
                            await onSubmit()
                            if (deleteInvoiceError.value) {
                                toast.add({
                                    title: 'Erreur',
                                    description: 'Une erreur est survenue lors de la suppression de la facture.',
                                    color: 'error'
                                })
                            }
                            toast.add({
                                title: 'Facture supprimée',
                                description: 'La facture a été supprimée.',
                                color: 'success'
                            })
                        }
                    }),
                ]) : null
            }
        }
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