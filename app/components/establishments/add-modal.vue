<script setup lang="ts">
const { isOpen, formState, onSubmit } = useEstablishmentCreate()
const { canCreateEstablishment } = useSubscriptionPlan() 
</script>

<template>
    <UModal v-model:open="isOpen" title="Créer une structure"
        description="Créer une nouvelle structure pour gérer vos factures et fournisseurs.">

        <template #body>
            <UForm :schema="CreateEstablishmentSchema" :state="formState" class="space-y-4" @submit="onSubmit">
                <UFormField label="Nom" placeholder="John Doe" name="name">
                    <UInput v-model="formState.name" class="w-full" />
                </UFormField>
                <div class="flex justify-end gap-2">
                    <UButton label="Annuler" color="neutral" variant="subtle" @click="isOpen = false" />
                    <UButton label="Créer" :disabled="!canCreateEstablishment" color="primary" variant="solid"
                        type="submit" />
                </div>
            </UForm>
        </template>
    </UModal>
</template>
