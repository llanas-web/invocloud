<script setup lang="ts">
    import { useInvoicesTableList } from '~/composables/invoices/table-list';

    const { pending: invoicePending } = useInvoices();
    const { statusFilter, filteredInvoices } = useInvoicesTableList();

    const invoicesStats = computed(() => {
        const total = filteredInvoices.value.reduce(
            (sum, invoice) => sum + (invoice.amount ?? 0),
            0,
        );
        const count = filteredInvoices.value.length;
        const pendingCount = filteredInvoices.value.filter(
            (invoice) =>
                invoice.isOverdue,
        ).length;
        return {
            total,
            count,
            pendingCount,
        };
    })

    function formatCurrency(value: number): string {
        return value.toLocaleString('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        })
    }

    const onPendingInvoiceClick = () => {
        if (statusFilter.value === 'error') {
            statusFilter.value = 'all'
        } else {
            statusFilter.value = 'error'
        }
    }
</script>

<template>
    <UPageGrid class="grid-cols-3 gap-4 sm:gap-6 lg:gap-px">
        <UPageCard icon="i-lucide-euro" title="Volumes" variant="subtle" :ui="{
            container: 'gap-y-1.5',
            wrapper: 'items-center md:items-start',
            leading: 'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col',
            title: 'font-normal text-muted text-xs uppercase'
        }" class="lg:rounded-none first:rounded-l-lg last:rounded-r-lg hover:z-1">
            <div class="flex items-center justify-center md:justify-start gap-2">
                <template v-if="invoicePending">
                    <USkeleton class="w-24 h-8" />
                </template>
                <template v-else>
                    <span class="text-lg lg:text-2xl font-semibold text-highlighted">
                        {{ formatCurrency(invoicesStats.total) }}
                    </span>
                </template>
            </div>
        </UPageCard>
        <UPageCard icon="i-lucide-shopping-cart" title="Factures" variant="subtle" :ui="{
            container: 'gap-y-1.5',
            wrapper: 'items-center md:items-start',
            leading: 'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col',
            title: 'font-normal text-muted text-xs uppercase'
        }" class="lg:rounded-none first:rounded-l-lg last:rounded-r-lg hover:z-1">
            <div class="flex items-center justify-center md:justify-start gap-2">
                <template v-if="invoicePending">
                    <USkeleton class="w-24 h-8" />
                </template>
                <template v-else>
                    <span class="text-lg lg:text-2xl font-semibold text-highlighted">
                        {{ invoicesStats.count }}
                    </span>
                </template>
            </div>
        </UPageCard>
        <UPageCard icon="i-lucide-clock" title="En retard" variant="subtle" :highlight="statusFilter === 'error'" :ui="{
            container: 'gap-y-1.5',
            wrapper: 'items-center md:items-start',
            leading: 'p-2.5 rounded-full bg-red-500/10 ring ring-inset ring-red-500/25 flex-col',
            title: 'font-normal text-muted text-xs uppercase'
        }" class="lg:rounded-none first:rounded-l-lg last:rounded-r-lg hover:z-1 cursor-pointer"
            @click="onPendingInvoiceClick">
            <div class="flex items-center justify-center md:justify-start gap-2">
                <template v-if="invoicePending">
                    <USkeleton class="w-24 h-8" />
                </template>
                <template v-else>
                    <span class="text-lg lg:text-2xl font-semibold text-highlighted">
                        {{ invoicesStats.pendingCount }}
                    </span>
                </template>
            </div>
        </UPageCard>
    </UPageGrid>
</template>
