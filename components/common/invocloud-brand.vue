<script setup lang="ts">
const props = defineProps<{
    collapsed?: boolean
}>()
</script>

<template>
    <NuxtLink to="/">
        <div class="flex gap-4 h-8">
            <UIcon name="i-custom-invocloud-logo" class="text-primary size-10" />
            <UIcon v-if="!collapsed" name="i-custom-invocloud" class="hidden md:block text-primary h-10" />
        </div>
    </NuxtLink>
</template>