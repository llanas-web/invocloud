<script setup lang="ts">
    import * as z from 'zod'

    const { isLoading, formState } = useUploadWizard()

    const fileFormSchema = z.object({
        senderEmail: z.email('Adresse email invalide'),
        recipientEmail: z.email('Adresse email invalide'),
        invoiceFile: z.instanceof(File, {
            message: 'Le fichier doit être un PDF ou une image'
        }),
        comment: z.string().optional()
    })
</script>

<template>
    <UForm ref="stepFileForm" :schema="fileFormSchema" :state="formState" class="space-y-4 mt-8">
        <UFormField label="Envoyer à" placeholder="Jean Dupont" name="recipientEmail" required>
            <UInput v-model="formState.recipientEmail" placeholder="Email du destinataire" class="w-full"
                :disabled="isLoading" />
        </UFormField>
        <UFormField label="Votre email" placeholder="Votre email" name="senderEmail" required>
            <UInput v-model="formState.senderEmail" placeholder="Votre email" class="w-full" :disabled="isLoading" />
        </UFormField>
        <UFormField label="Facture" name="invoiceFile" required>
            <UFileUpload v-model="formState.invoiceFile" accept="image/*,application/pdf" class="min-h-28" />
        </UFormField>
        <UFormField label="Commentaire" name="comment">
            <UInput v-model="formState.comment" placeholder="Commentaire" class="w-full" :disabled="isLoading" />
        </UFormField>
    </UForm>
</template>