<script setup lang="ts">
    import type { MemberRole, MemberStatus } from '~~/shared/domain/establishment/member.entity';

    const props = defineProps<{
        member: {
            fullName: string | null;
            email: string;
            status: MemberStatus;
            role: MemberRole;
        }
    }>()

    const statusLabel = computed(() => {
        const labels = {
            accepted: 'Accepté',
            declined: 'Refusé',
            pending: 'En attente'
        } as const;
        return labels[props.member.status];
    });

    const statusColor = computed(() => {
        const colors = {
            accepted: 'success',
            declined: 'error',
            pending: 'warning'
        } as const;
        return colors[props.member.status];
    });
</script>

<template>
    <li class="flex items-center justify-between gap-3 py-3 px-4 sm:px-6">
        <div class="flex items-center gap-3 min-w-0">
            <div class="text-sm min-w-0">
                <p class="text-highlighted font-medium truncate">
                    {{ member.fullName }}
                </p>
                <p class="text-muted truncate">
                    {{ member.email }}
                </p>
            </div>
        </div>

        <div class="flex items-center gap-3">
            <UBadge :label="statusLabel" :color="statusColor">
            </UBadge>
            <!-- <USelect :model-value="member.role" :items="['member', 'owner']" color="neutral"
                        :ui="{ value: 'capitalize', item: 'capitalize' }" />

                    <UDropdownMenu :items="items" :content="{ align: 'end' }">
                        <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" />
                    </UDropdownMenu> -->
        </div>
    </li>
</template>