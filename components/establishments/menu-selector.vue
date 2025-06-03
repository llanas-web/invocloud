<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
    collapsed?: boolean
}>()

const { establishments, selectedEstablishment, pending } = useEstablishments()

const items = computed<DropdownMenuItem[][]>(() => {
    return [
        establishments.value.map(establishment => ({
            label: establishment.name,
            onSelect() {
                selectedEstablishment.value = establishment
            }
        }),
        ), [{
            label: 'Créer une structure',
            icon: 'i-lucide-circle-plus'
        }, {
            label: 'Gérer la structure',
            icon: 'i-lucide-cog'
        }]]
})
</script>

<template>
    <template v-if="pending">
        <USkeleton class="h-4 w-[250px]" />
    </template>
    <UDropdownMenu v-else :items="items" :content="{ align: 'center', collisionPadding: 12 }"
        :ui="{ content: collapsed ? 'w-40' : 'w-(--reka-dropdown-menu-trigger-width)' }">
        <UButton v-bind="{
            ...selectedEstablishment,
            label: collapsed ? undefined : selectedEstablishment?.name,
            trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down'
        }" color="neutral" variant="ghost" block :square="collapsed" class="data-[state=open]:bg-elevated"
            :class="[!collapsed && 'py-2']" :ui="{
                trailingIcon: 'text-dimmed'
            }" />
    </UDropdownMenu>
</template>
