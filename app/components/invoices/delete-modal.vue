<script setup lang="ts">
    import { useInvoicesDelete } from '~/composables/invoices/delete';

    const { open, pending, onSubmit, selectedInvoices } = useInvoicesDelete()

    const cancel = () => {
        open.value = false
    }
</script>

<template>
    <UModal v-model:open="open"
        :title="`Suppression de ${selectedInvoices.length} ${isPlural(selectedInvoices.length, 'factures', 'facture')}`"
        :description="`Êtes-vous sûr de vouloir supprimer ${isPlural(selectedInvoices.length, 'ces', 'cette')} ${isPlural(selectedInvoices.length, 'factures', 'facture')} ?`">
        <template #body>
            <div class="flex justify-end gap-2">
                <UButton label="Annuler" color="neutral" variant="subtle" @click="cancel" :disabled="pending" />
                <UButton label="Supprimer" color="error" variant="solid" loading-auto @click="onSubmit"
                    :loading="pending" />
            </div>
        </template>
    </UModal>
</template>
