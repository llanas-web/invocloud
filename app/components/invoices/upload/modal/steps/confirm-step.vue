<script setup lang="ts">
    const { formState, possibleEstablishmentIds, confirmState } = useUploadWizard()
</script>

<template>
    <UForm ref="stepFileForm" :state="formState" class="space-y-4 mt-8">
        <UFormField label="Envoyer à" placeholder="Jean Dupont" name="establishmentId">
            <USelect v-model="confirmState.establishmentId" :items="possibleEstablishmentIds" value-key="id"
                label-key="name" name="establishmentId" placeholder="Sélectionner un destinataire" class="w-full"
                :disabled="possibleEstablishmentIds.length === 1" />
        </UFormField>
        <UFormField label="Votre email" placeholder="Votre email" name="senderEmail">
            <UInput v-model="formState.senderEmail" placeholder="Votre email" class="w-full" :disabled="true" />
        </UFormField>
        <UFormField label="Fichier" name="invoiceFile">
            <UInput v-model="formState.invoiceFile!.name" class="w-full" :disabled="true" />
        </UFormField>
        <UFormField label="Commentaire" name="comment">
            <UInput v-model="formState.comment" placeholder="Commentaire" class="w-full" :disabled="true" />
        </UFormField>
    </UForm>
</template>