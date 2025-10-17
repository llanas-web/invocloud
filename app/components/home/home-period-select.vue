<script setup lang="ts">
  import { eachDayOfInterval } from 'date-fns'
  import { useInvoicesTableList } from '~/composables/invoices/table-list';

  const months = [
    { label: 'Janvier', value: 1 },
    { label: 'Février', value: 2 },
    { label: 'Mars', value: 3 },
    { label: 'Avril', value: 4 },
    { label: 'Mai', value: 5 },
    { label: 'Juin', value: 6 },
    { label: 'Juillet', value: 7 },
    { label: 'Août', value: 8 },
    { label: 'Septembre', value: 9 },
    { label: 'Octobre', value: 10 },
    { label: 'Novembre', value: 11 },
    { label: 'Décembre', value: 12 }
  ];

  const selectedMonth = ref();
  const startRange = ref<Date | null>(null);
  const endRange = ref<Date | null>(null);

  const { rangeFilter } = useInvoicesTableList();

  watch(() => rangeFilter.value, (newRange) => {
    if (newRange.start !== startRange.value || newRange.end !== endRange.value) {
      selectedMonth.value = undefined;
    }
  }, { immediate: true });

  const onMonthChange = (month: number) => {
    const currentYear = new Date().getFullYear();
    startRange.value = new Date(currentYear, month - 1, 1);
    endRange.value = new Date(currentYear, month, 0); // Last day of the month
    rangeFilter.value = {
      start: startRange.value,
      end: endRange.value
    };
  };
</script>

<template>
  <USelect v-model="selectedMonth" :items="months" variant="soft" class="data-[state=open]:bg-elevated w-24"
    value-key="value" label-key="label" placeholder="Mois ..."
    :ui="{ value: 'capitalize', itemLabel: 'capitalize', trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
    @change="onMonthChange(selectedMonth)" />
</template>
