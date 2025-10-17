<script setup lang="ts">
    import type { LazyEstablishmentsAddModal } from '#components';
    import type { DropdownMenuItem } from '@nuxt/ui'

    const props = defineProps<{
        collapsed?: boolean
    }>()

    const { establishments, selectedEstablishment, pending, selectEstablishment } = useEstablishmentsList()
    const { userSettings, toggleFavorite: { execute, pending: togglePending, error: toggleError, data: toggleData } } = useUserSettings()

    const addModel = useTemplateRef<typeof LazyEstablishmentsAddModal>('addModal')

    const items = computed<DropdownMenuItem[][]>(() => {
        console.log(userSettings.value);
        return [
            establishments.value.map(establishment => ({
                id: establishment.id,
                label: establishment.name,
                onSelect: () => selectEstablishment(establishment.id),
                isFavorite: userSettings.value.favorite_establishment_id === establishment.id,
            })), [{
                label: 'Créer une structure',
                icon: 'i-lucide-circle-plus',
                onSelect() {
                    addModel.value?.showModal();
                }
            }, {
                label: 'Gérer la structure',
                icon: 'i-lucide-cog'
            }]]
    })
</script>

<template>
    <template v-if="pending">
        <USkeleton class="h-9 w-full" />
    </template>
    <UDropdownMenu v-else :items="items" :content="{ align: 'center', collisionPadding: 12 }"
        :ui="{ content: collapsed ? 'w-40' : 'w-(--reka-dropdown-menu-trigger-width)' }">
        <template #item="{ item }">
            <div class="flex items-center justify-between w-full" @click="item.onSelect">
                <span>{{ item.label }}</span>
                <UButton v-if="item.id" :class="item.isFavorite ? '' : 'text-gray-400 dark:text-gray-600'"
                    color="warning" variant="ghost" size="xs"
                    :icon="item.isFavorite ? 'i-lucide-star' : 'i-lucide-star'" @click.stop="execute(item.id)">
                </UButton>
            </div>
        </template>
        <UButton v-bind="selectedEstablishment" color="neutral" variant="soft" block :square="collapsed"
            class="data-[state=open]:bg-elevated" :class="[!collapsed && 'py-2']"
            :ui="{ trailingIcon: 'text-dimmed', leadingIcon: collapsed ? 'hidden' : 'block' }"
            :label="selectedEstablishment?.name || 'Sélectionner une structure'"
            trailing-icon="i-lucide-chevrons-up-down" leading-icon="i-lucide-building">
        </UButton>
    </UDropdownMenu>

    <LazyEstablishmentsAddModal ref="addModal" />
</template>
