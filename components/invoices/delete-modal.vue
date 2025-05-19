<script setup lang="ts">

    const { deleteInvoices } = useInvoices()

    const props = withDefaults(defineProps<{
        listInvoicesId?: string[]
    }>(), {
        listInvoicesId: () => []
    })

    const open = ref(false)

    async function onSubmit() {
        const { listInvoicesId } = toRefs(props)
        await deleteInvoices(listInvoicesId.value)
    }
</script>

<template>
    <UModal v-model:open="open"
        :title="`Delete ${listInvoicesId.length} customer${listInvoicesId.length > 1 ? 's' : ''}`"
        :description="`Are you sure, this action cannot be undone.`">
        <slot />

        <template #body>
            <div class="flex justify-end gap-2">
                <UButton label="Cancel" color="neutral" variant="subtle" @click="open = false" />
                <UButton label="Delete" color="error" variant="solid" loading-auto @click="onSubmit" />
            </div>
        </template>
    </UModal>
</template>
