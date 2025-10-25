<script setup lang="ts">
    import { getPaginationRowModel, type Row } from '@tanstack/table-core';
    import { createInvoiceColumns } from './columns';
    import { createRowActions, type RowAction } from './row-actions';
    import type { InvoiceDetailsDTO } from '~~/shared/application/invoice/dto';

    const table = useTemplateRef('invoiceTable');

    const UDropdownMenu = resolveComponent('UDropdownMenu')
    const UButton = resolveComponent('UButton')

    const { invoices, pending, statusFilter, supplierFilter, actions } = useInvoices();
    const { open: isSendModalOpen, selectedInvoices: listInvoicesToSend } = useInvoicesSend();
    const { open: isDeleteModalOpen, selectedInvoices: listInvoicesToDelete } = useInvoicesDelete();
    const { launchDownloadWorker, progress, running } = useWorker();

    const rowSelection = ref({});
    const pagination = ref({
        pageIndex: 0,
        pageSize: 10
    });

    // Actions handlers
    const rowActions: RowAction = {
        onSend: (id: string) => {
            listInvoicesToSend.value = [id];
            isSendModalOpen.value = true;
        },
        onView: (id: string) => {
            navigateTo(`/app/invoices/${id}`);
        },
        onUpdateStatus: async (id: string, status: 'paid' | 'error') => {
            await actions.updateStatus.execute(id, status, status === 'paid' ? new Date() : null);
        },
        onDelete: (id: string) => {
            listInvoicesToDelete.value = [id];
            isDeleteModalOpen.value = true;
        }
    };

    // Columns avec actions intégrées
    const columns = [
        ...createInvoiceColumns((supplierId) => {
            supplierFilter.value = [supplierId];
        }),
        {
            id: 'actions',
            cell: ({ row }: { row: Row<InvoiceDetailsDTO> }) =>
                h('div', { class: 'text-right' },
                    h(UDropdownMenu, {
                        content: { align: 'end' },
                        items: createRowActions(row.original, rowActions)
                    }, () =>
                        h(UButton, {
                            icon: 'i-lucide-ellipsis-vertical',
                            color: 'neutral',
                            variant: 'ghost',
                            class: 'ml-auto'
                        })
                    )
                )
        }
    ];

    const selectedRows = computed(() => {
        return table.value?.tableApi?.getFilteredSelectedRowModel().rows.map(r => r.original) ?? [];
    });

    const handleBulkSend = () => {
        listInvoicesToSend.value = selectedRows.value.map(r => r.id);
        isSendModalOpen.value = true;
    };

    const handleBulkDelete = () => {
        listInvoicesToDelete.value = selectedRows.value.map(r => r.id);
        isDeleteModalOpen.value = true;
    };

    const handleBulkDownload = () => {
        if (selectedRows.value.length === 0) return;
        launchDownloadWorker.execute(selectedRows.value);
    };
</script>

<template>
    <LazyInvoicesSendModal />
    <LazyInvoicesDeleteModal />

    <InvoicesListTableToolbar :selected-count="table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0"
        :is-downloading="running" :download-progress="progress" v-model:status-filter="statusFilter"
        @send="handleBulkSend" @download="handleBulkDownload" @delete="handleBulkDelete" />

    <UTable ref="invoiceTable" v-model:row-selection="rowSelection" v-model:pagination="pagination"
        :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }" class="shrink-0" :data="invoices"
        :columns="columns" :loading="pending" :ui="{
            base: 'table-fixed border-separate border-spacing-0',
            thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
            tbody: '[&>tr]:last:[&>td]:border-b-0',
            th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
            td: 'border-b border-default'
        }" />

    <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
        <div class="text-sm text-muted">
            {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} de {{
                table?.tableApi?.getFilteredRowModel().rows.length || 0 }}
            ligne(s) sélectionnée(s).
        </div>

        <div class="flex items-center gap-1.5">
            <UPagination :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
                :items-per-page="table?.tableApi?.getState().pagination.pageSize"
                :total="table?.tableApi?.getFilteredRowModel().rows.length"
                @update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)" />
        </div>
    </div>
</template>