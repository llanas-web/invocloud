<script setup lang="ts">
    import type { DropdownMenuItem } from '@nuxt/ui'

    const { members } = useEstablishmentDetails()
    const q = ref('')

    const items = [{
        label: 'Edit member',
        onSelect: () => console.log('Edit member')
    }, {
        label: 'Remove member',
        color: 'error' as const,
        onSelect: () => console.log('Remove member')
    }] satisfies DropdownMenuItem[]

    const memberStatusLabels = {
        accepted: { label: 'Accepté', color: 'success' },
        declined: { label: 'Refusé', color: 'error' },
        pending: { label: 'En attente', color: 'warning' }
    } as const
</script>

<template>
    <UPageCard variant="subtle"
        :ui="{ container: 'p-0 sm:p-0 gap-y-0', wrapper: 'items-stretch', header: 'p-4 mb-0 border-b border-default' }">
        <template #header>
            <UInput v-model="q" icon="i-lucide-search" placeholder="Rechercher des membres" class="w-full" />
        </template>

        <ul role="list" class="divide-y divide-default">
            <EstablishmentsMembersItemRow v-for="(member, index) in members" :key="index" :member="member" />
        </ul>
    </UPageCard>
</template>
