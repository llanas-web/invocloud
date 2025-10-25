<script setup lang="ts">

    const { invoices, pending, statusFilter } = useInvoices();

    const overdueInvoices = computed(() =>
        invoices.value?.filter((i) =>
            i.dueDate && !i.paidAt && new Date(i.dueDate) < new Date()
        ) || []
    );

    const total = computed(() =>
        invoices.value.reduce(
            (sum, invoice) => sum + (invoice.amount ?? 0),
            0,
        )
    );

    function formatCurrency(value: number): string {
        return value.toLocaleString('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        })
    }

    const onPendingInvoiceClick = () => {
        if (statusFilter.value === 'overdue') {
            statusFilter.value = undefined
        } else {
            statusFilter.value = 'overdue'
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
                <template v-if="pending">
                    <USkeleton class="w-24 h-8" />
                </template>
                <template v-else>
                    <span class="text-lg lg:text-2xl font-semibold text-highlighted">
                        {{ formatCurrency(total) }}
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
                <template v-if="pending">
                    <USkeleton class="w-24 h-8" />
                </template>
                <template v-else>
                    <span class="text-lg lg:text-2xl font-semibold text-highlighted">
                        {{ invoices.length }}
                    </span>
                </template>
            </div>
        </UPageCard>
        <UPageCard icon="i-lucide-clock" title="En retard" variant="subtle" :highlight="statusFilter === 'overdue'" :ui="{
            container: 'gap-y-1.5',
            wrapper: 'items-center md:items-start',
            leading: 'p-2.5 rounded-full bg-red-500/10 ring ring-inset ring-red-500/25 flex-col',
            title: 'font-normal text-muted text-xs uppercase'
        }" class="lg:rounded-none first:rounded-l-lg last:rounded-r-lg hover:z-1 cursor-pointer"
            @click="onPendingInvoiceClick">
            <div class="flex items-center justify-center md:justify-start gap-2">
                <template v-if="pending">
                    <USkeleton class="w-24 h-8" />
                </template>
                <template v-else>
                    <span class="text-lg lg:text-2xl font-semibold text-highlighted">
                        {{ overdueInvoices.length }}
                    </span>
                </template>
            </div>
        </UPageCard>
    </UPageGrid>
</template>
