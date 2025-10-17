<script setup lang="ts">
    import type { DropdownMenuItem } from '@nuxt/ui'

    const toast = useToast()
    const { members } = useMembers()
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
            <li v-for="(member, index) in members" :key="index"
                class="flex items-center justify-between gap-3 py-3 px-4 sm:px-6">
                <div class="flex items-center gap-3 min-w-0">
                    <div class="text-sm min-w-0">
                        <p class="text-highlighted font-medium truncate">
                            {{ member.user?.fullName }}
                        </p>
                        <p class="text-muted truncate">
                            {{ member.user?.email }}
                        </p>
                    </div>
                </div>

                <div class="flex items-center gap-3">
                    <UBadge :label="memberStatusLabels[member.status].label"
                        :color="memberStatusLabels[member.status].color">
                    </UBadge>
                    <!-- <USelect :model-value="member.role" :items="['member', 'owner']" color="neutral"
                        :ui="{ value: 'capitalize', item: 'capitalize' }" />

                    <UDropdownMenu :items="items" :content="{ align: 'end' }">
                        <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" />
                    </UDropdownMenu> -->
                </div>
            </li>
        </ul>
    </UPageCard>
</template>
