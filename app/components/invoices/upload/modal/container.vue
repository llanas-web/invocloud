<script setup lang="ts">
const { open, stepIndex, isLoading, onPrev, onValidate } = useInvoiceUpload()

const props = defineProps<{
    size?: 'sm' | 'md' | 'lg' | 'xl',
    variant?: 'solid' | 'ghost' | 'subtle' | 'link'
}>()

const { currentUser } = useUser();

const formStep = {
    slot: 'form' as const,
    label: 'Send Invoices',
    title: 'Envoyer des factures',
    description: 'Envoyez des fichiers de factures en toute sécurité aux parties prenantes',
    icon: 'i-lucide-send'
};

const tokenStep = {
    slot: 'token' as const,
    label: 'Confirmer l\'email',
    title: 'Confirmer l\'email',
    description: 'Confirmez votre adresse e-mail',
    icon: 'i-lucide-check'
};

const confirmStep = {
    slot: 'confirm' as const,
    label: 'Confirmer l\'envoie',
    title: 'Confirmer l\'envoie',
    description: 'Confirmez l\'envoie du fichier',
    icon: 'i-lucide-file-check'
};
const stepItems = ref(!currentUser.value ? [formStep, tokenStep, confirmStep] : [formStep, confirmStep])
</script>

<template>
    <UModal v-model:open="open" title="Envoyer des factures"
        description="Envoyez des fichiers de factures en toute sécurité aux parties prenantes"
        :ui="{ footer: 'justify-end' }">
        <template #body>
            <UStepper v-model="stepIndex" ref="stepper" :items="stepItems" size="sm">
                <template #form>
                    <InvoicesUploadModalStepsFormStep />
                </template>
                <template #token>
                    <InvoicesUploadModalStepsTokenStep />
                </template>
                <template #confirm>
                    <InvoicesUploadModalStepsConfirmStep />
                </template>
            </UStepper>
        </template>
        <template #footer>
            <UButton label="Annuler" color="neutral" variant="subtle" @click="onPrev" :disabled="isLoading" />
            <UButton label="Envoyer" color="primary" variant="solid" @click="onValidate" :loading="isLoading" />
        </template>
    </UModal>
</template>