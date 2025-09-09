<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'
const props = defineProps<{
    label?: string
}>()

const emit = defineEmits<{
    (e: 'input', value: string | null): void
    (e: 'change', value: string | null): void
    (e: 'blur'): void
}>()

const df = new DateFormatter('fr-FR', {
    dateStyle: 'medium'
})

const modelValue = defineModel<string | null>()
const open = ref(false)

const calendarDate = shallowRef<CalendarDate | null>(modelValue.value ? new CalendarDate(
    new Date(modelValue.value).getFullYear(),
    new Date(modelValue.value).getMonth() + 1,
    new Date(modelValue.value).getDate()
) : null)


watch(calendarDate, async (newDate) => {
    const val = newDate
        ? newDate.toDate(getLocalTimeZone()).toISOString().split('T')[0]
        : null

    // update outer v-model
    modelValue.value = val

    // fire events Nuxt UI listens to so it re-validates this field
    emit('input', val)
    emit('change', val)

})

// when the popover closes, emit blur so 'validate-on' can clear the error
watch(open, (now, was) => {
    if (was === true && now === false) emit('blur')
})
</script>

<template>
    <UPopover v-model:open="open">
        <UButton size="md" variant="outline" trailing-icon="i-lucide-calendar"
            class="w-full font-medium ring-accented flex justify-between" :ui="{
                trailingIcon: 'text-highlighted'
            }">
            {{ calendarDate ? df.format(calendarDate.toDate(getLocalTimeZone()))
                : 'jj / mm / aaaa' }}
        </UButton>
        <template #content>
            <UCalendar v-model="calendarDate" class="p-2" @update:model-value="open = false" />
        </template>
    </UPopover>
</template>
