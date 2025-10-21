<script setup lang="ts">
    import { useInvoicesSend } from '~/composables/invoices/send';

    const { selectedInvoices, formState, open, action, resetForm } = useInvoicesSend()

    const { execute, pending, data, error } = action;

    const cancel = () => {
        open.value = false
        resetForm()
    }
</script>

<template>
    <UModal v-model:open="open" :title="`Envoyer ${isPlural(selectedInvoices.length, 'factures', 'facture')}`"
        :description="`Envoyer un lien sécurisé de ${isPlural(selectedInvoices.length, 'vos', 'votre')} ${isPlural(selectedInvoices.length, 'factures', 'facture')} par email`">
        <template #body>
            <UForm :state="formState" class="space-y-4" :disabled="pending">
                <UFormField label="Email du destinataire" name="email">
                    <UInput v-model="formState.email" placeholder="Email du destinataire" class="w-full" />
                </UFormField>
                <div class="flex justify-end gap-2 mt-8">
                    <UButton label="Annuler" color="neutral" variant="subtle" @click="cancel" :disabled="pending" />
                    <UButton label="Envoyer" color="primary" variant="solid" @click="execute" :loading="pending" />
                </div>
            </UForm>
        </template>
    </UModal>
</template>
