<script setup lang="ts">
    const props = defineProps<{
        title: string;
        description?: string;
        validateLabel?: string;
        rejectLabel?: string;
        danger?: boolean;
        preventClose?: boolean;
        defaultFocus?: 'ok' | 'cancel';
        modalProps?: Record<string, any>;
        render?: () => any;
        canValidate?: () => boolean;
    }>()

    const emit = defineEmits<{
        close: [boolean]
    }>()
</script>

<template>
    <!-- Guard the whole modal with current to avoid “empty” instances -->
    <UModal :close="{ onClick: () => emit('close', false) }" :title="props.title" :description="props.description">
        <template #footer>
            <div class="flex items-center justify-end gap-2">
                <UButton variant="soft" color="neutral" @click="() => emit('close', false)"
                    :autofocus="props.defaultFocus !== 'ok'">
                    {{ props.rejectLabel ?? 'Annuler' }}
                </UButton>
                <UButton :color="props.danger ? 'error' : 'primary'" :disabled="props.canValidate?.() === false"
                    :autofocus="props.defaultFocus !== 'cancel'" @click="() => emit('close', true)">
                    {{ props.validateLabel ?? 'Valider' }}
                </UButton>
            </div>
        </template>
    </UModal>
</template>
