<script setup lang="ts">
import type { Period, Range, Stat } from '~/types'

const props = defineProps<{
  period: Period
  range: Range
}>()

const { pending: invoicePending, invoices, getInvoicesStats } = useInvoices();
const { pending: supplierPending, suppliers, getSuppliersStats } = useSuppliers();

const invoicesStats = ref({
  total: 0,
  count: 0
})

const suppliersStats = ref({
  count: 0
})

watch(() => [props.range, invoices.value], async () => {
  invoicesStats.value = getInvoicesStats(props.range);
}, { immediate: true })

watch(() => [props.range, suppliers.value], async () => {
  suppliersStats.value = getSuppliersStats(props.range);
}, { immediate: true })

console.log('Invoices Stats:', invoicesStats.value)

function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  })
}
</script>

<template>
  <UPageGrid class="lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-px">
    <UPageCard icon="i-lucide-circle-dollar-sign" title="Dépenses" to="/invoices" variant="subtle" :ui="{
      container: 'gap-y-1.5',
      wrapper: 'items-start',
      leading: 'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col',
      title: 'font-normal text-muted text-xs uppercase'
    }" class="lg:rounded-none first:rounded-l-lg last:rounded-r-lg hover:z-1">
      <div class="flex items-center gap-2">
        <template v-if="invoicePending">
          <USkeleton class="w-24 h-8" />
        </template>
        <template v-else>
          <span class="text-2xl font-semibold text-highlighted">
            {{ formatCurrency(invoicesStats.total) }}
          </span>
        </template>
      </div>
    </UPageCard>
    <UPageCard icon="i-lucide-shopping-cart" title="Factures" to="/invoices" variant="subtle" :ui="{
      container: 'gap-y-1.5',
      wrapper: 'items-start',
      leading: 'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col',
      title: 'font-normal text-muted text-xs uppercase'
    }" class="lg:rounded-none first:rounded-l-lg last:rounded-r-lg hover:z-1">
      <div class="flex items-center gap-2">
        <template v-if="invoicePending">
          <USkeleton class="w-24 h-8" />
        </template>
        <template v-else>
          <span class="text-2xl font-semibold text-highlighted">
            {{ invoicesStats.count }}
          </span>
        </template>
      </div>
    </UPageCard>
    <UPageCard icon="i-lucide-users" title="Fournisseurs" to="/suppliers" variant="subtle" :ui="{
      container: 'gap-y-1.5',
      wrapper: 'items-start',
      leading: 'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col',
      title: 'font-normal text-muted text-xs uppercase'
    }" class="lg:rounded-none first:rounded-l-lg last:rounded-r-lg hover:z-1">
      <div class="flex items-center gap-2">
        <template v-if="supplierPending">
          <USkeleton class="w-24 h-8" />
        </template>
        <template v-else>
          <span class="text-2xl font-semibold text-highlighted">
            {{ suppliersStats.count }}
          </span>
        </template>
      </div>
    </UPageCard>
  </UPageGrid>
</template>
