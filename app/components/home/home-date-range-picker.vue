<script setup lang="ts">
import { DateFormatter, getLocalTimeZone, CalendarDate, today, startOfMonth, endOfMonth } from '@internationalized/date'

const df = new DateFormatter('fr-FR', {
  dateStyle: 'medium'
})
const dfSmall = new DateFormatter('fr-FR', {
  dateStyle: 'short'
})

const { rangeFilter: selected } = useInvoices();

const ranges = [
  { label: 'Derniers 7 jours', days: 7 },
  { label: 'Derniers 14 jours', days: 14 },
  { label: 'Derniers 30 jours', days: 30 },
  { label: 'Derniers 3 mois', months: 3 },
  { label: 'Derniers 6 mois', months: 6 },
  { label: 'Dernière année', years: 1 }
]

const toCalendarDate = (date: Date) => {
  return new CalendarDate(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  )
}

const calendarRange = computed({
  get: () => ({
    start: selected.value.start ? toCalendarDate(selected.value.start) : toCalendarDate(new Date()),
    end: selected.value.end ? toCalendarDate(selected.value.end) : toCalendarDate(new Date())
  }),
  set: (newValue: { start: CalendarDate | null, end: CalendarDate | null }) => {
    selected.value = {
      start: newValue.start ? newValue.start.toDate(getLocalTimeZone()) : new Date(),
      end: newValue.end ? newValue.end.toDate(getLocalTimeZone()) : new Date()
    }
  }
})

const isRangeSelected = (range: { days?: number, months?: number, years?: number }) => {
  if (!selected.value.start || !selected.value.end) return false

  const currentDate = today(getLocalTimeZone())
  let startDate = currentDate.copy()

  if (range.days) {
    startDate = startDate.subtract({ days: range.days })
  } else if (range.months) {
    startDate = startDate.subtract({ months: range.months })
  } else if (range.years) {
    startDate = startDate.subtract({ years: range.years })
  }

  const selectedStart = toCalendarDate(selected.value.start)
  const selectedEnd = toCalendarDate(selected.value.end)

  return selectedStart.compare(startDate) === 0 && selectedEnd.compare(currentDate) === 0
}

const selectRange = (range: { days?: number, months?: number, years?: number }) => {
  const endDate = today(getLocalTimeZone())
  let startDate = endDate.copy()

  if (range.days) {
    startDate = startDate.subtract({ days: range.days })
  } else if (range.months) {
    startDate = startDate.subtract({ months: range.months })
  } else if (range.years) {
    startDate = startDate.subtract({ years: range.years })
  }

  selected.value = {
    start: startDate.toDate(getLocalTimeZone()),
    end: endDate.toDate(getLocalTimeZone())
  }
}

const selectCurrentMonth = () => {
  const currentDate = today(getLocalTimeZone())
  selected.value = {
    start: startOfMonth(currentDate).toDate(getLocalTimeZone()),
    end: endOfMonth(currentDate).toDate(getLocalTimeZone())
  }
}

const onMonthSelect = (indicator: -1 | 1) => {
  if (indicator === -1) {
    selected.value = {
      start: startOfMonth(calendarRange.value.end.subtract({ months: 1 })).toDate(getLocalTimeZone()),
      end: endOfMonth(calendarRange.value.end.subtract({ months: 1 })).toDate(getLocalTimeZone())
    }
  } else if (indicator === 1) {
    selected.value = {
      start: startOfMonth(calendarRange.value.end.add({ months: 1 })).toDate(getLocalTimeZone()),
      end: endOfMonth(calendarRange.value.end.add({ months: 1 })).toDate(getLocalTimeZone())
    }
  }
}
</script>

<template>
  <UPopover :content="{ align: 'start' }" :modal="true">
    <UButton color="neutral" variant="ghost" icon="i-lucide-calendar" class="data-[state=open]:bg-elevated group" :ui="{
      leadingIcon: 'hidden md:block'
    }">
      <span class="truncate">
        <template v-if="selected.start">
          <template v-if="selected.end">
            <span class="text-sm md:text-md">
              {{ df.formatRange(selected.start, selected.end) }}
            </span>
          </template>
          <template v-else>
            {{ df.formatRange(selected.start, selected.end) }}
          </template>
        </template>
        <template v-else>
          Pick a date
        </template>
      </span>

      <template #trailing>
        <UIcon name="i-lucide-chevron-down"
          class="shrink-0 text-dimmed size-5 group-data-[state=open]:rotate-180 transition-transform duration-200" />
      </template>
    </UButton>

    <template #content>
      <div class="flex items-stretch sm:divide-x divide-default">
        <div class="hidden sm:flex flex-col justify-center">
          <UButton v-for="(range, index) in ranges" :key="index" :label="range.label" color="neutral" variant="ghost"
            class="rounded-none px-4" :class="[isRangeSelected(range) ? 'bg-elevated' : 'hover:bg-elevated/50']"
            truncate @click="selectRange(range)" />
        </div>
        <div class="flex flex-col p-2 space-y-2">
          <UCalendar v-model="calendarRange" :number-of-months="1" range>
          </UCalendar>
          <div class="flex justify-between w-full">
            <UButton label="-1 mois" variant="subtle" color="neutral" size="sm" @click="() => onMonthSelect(-1)" />
            <UButton label="Mois en cours" variant="subtle" color="neutral" size="sm"
              @click="() => selectCurrentMonth()" />
            <UButton label="+1 mois" variant="subtle" color="neutral" size="sm" @click="() => onMonthSelect(1)" />
          </div>
        </div>
      </div>
    </template>
  </UPopover>
</template>
