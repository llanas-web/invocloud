<script setup lang="ts">
    const { members } = useEstablishmentDetails()
    const q = ref('')
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
