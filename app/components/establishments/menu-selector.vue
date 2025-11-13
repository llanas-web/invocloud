<script setup lang="ts">
    import type { LazyEstablishmentsAddModal } from '#components';
    import type { DropdownMenuItem } from '@nuxt/ui'

    const props = defineProps<{
        collapsed?: boolean
    }>()

    const { establishments, status, pending, selectEstablishment, selectedId } = useEstablishmentsList()
    const { isOpen } = useEstablishmentCreate();
    const { userSettings, actions } = useUser();

    const items = computed<DropdownMenuItem[][]>(() => {
        return [
            establishments.value.map(establishment => ({
                id: establishment.id,
                label: establishment.name,
                onSelect: () => selectEstablishment(establishment.id),
                isFavorite: userSettings.value?.favoriteEstablishmentId === establishment.id,
            })), [{
                label: 'Créer une structure',
                icon: 'i-lucide-circle-plus',
                onSelect: () => isOpen.value = true,
            }, {
                label: 'Gérer la structure',
                icon: 'i-lucide-cog',
                to: 'app/settings/establishments'
            }]]
    })

    const establishmentsLoading = computed(() => {
        return status.value === 'idle' || pending.value;
    })

    const selectedEstablishmentLabel = computed(() => {
        const selected = establishments.value.find(e => e.id === selectedId.value);
        console.log("establishments ", establishments.value);
        console.log("selectedId ", selectedId.value);
        console.log("selected establishment ", selected);
        return selected ? selected.name : 'Sélectionner une structure';
    })
</script>

<template>
    <template v-if="establishmentsLoading">
        <USkeleton class="h-9 w-full" />
    </template>
    <UDropdownMenu v-else :items="items" :content="{ align: 'center', collisionPadding: 12 }"
        :ui="{ content: collapsed ? 'w-40' : 'w-(--reka-dropdown-menu-trigger-width)' }">
        <template #item="{ item }">
            <div class="flex items-center justify-between w-full">
                <span>{{ item.label }}</span>
                <UButton v-if="item.id" :class="item.isFavorite ? '' : 'text-gray-400 dark:text-gray-600'"
                    color="warning" variant="ghost" size="xs"
                    :icon="item.isFavorite ? 'i-lucide-star' : 'i-lucide-star'"
                    @click.stop="() => actions.toggleFavorite.execute(item.id)">
                </UButton>
            </div>
        </template>
        <UButton v-bind="selectedId" color="neutral" variant="soft" block :square="collapsed"
            class="data-[state=open]:bg-elevated" :class="[!collapsed && 'py-2']"
            :ui="{ trailingIcon: 'text-dimmed', leadingIcon: collapsed ? 'hidden' : 'block' }"
            :label="selectedEstablishmentLabel" trailing-icon="i-lucide-chevrons-up-down"
            leading-icon="i-lucide-building">
        </UButton>
    </UDropdownMenu>

    <LazyEstablishmentsAddModal ref="addModal" />
</template>
