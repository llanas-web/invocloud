<script setup lang="ts">
    const { deleteInvoices } = useInvoices()
    const toast = useToast()

    const props = withDefaults(defineProps<{
        invoicesId?: string[]
    }>(), {
        invoicesId: () => []
    })

    const open = ref(false)
    const _invoicesId = ref<string[]>(props.invoicesId)

    async function onSubmit() {
        await deleteInvoices(_invoicesId.value)
        toast.add({
            title: 'Factures supprimées',
            description: _invoicesId.value.length > 1 ?
                'Les factures ont été supprimées.' : 'La facture a été supprimée.',
            color: 'success'
        })
    }

    function showDeleteModal(listInvoicesIdToDelete: string[]) {
        _invoicesId.value = listInvoicesIdToDelete
        open.value = true
    }

    defineExpose({
        showDeleteModal
    })
</script>

<template>
    <UModal v-model:open="open"
        :title="`Suppression de ${_invoicesId.length} facture${_invoicesId.length > 1 ? 's' : ''}`"
        description="Êtes-vous sûr de vouloir supprimer ces factures ?">
        <slot />

        <template #body>
            <div class="flex justify-end gap-2">
                <UButton label="Annuler" color="neutral" variant="subtle" @click="open = false" />
                <UButton label="Supprimer" color="error" variant="solid" loading-auto @click="onSubmit" />
            </div>
        </template>
    </UModal>
</template>
