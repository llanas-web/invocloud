<script setup lang="ts">
    const { formState, execute } = useUserUpdate();
</script>

<template>
    <UForm id="settings" :schema="UpdateUserSchema" :state="formState" @submit="execute">
        <UPageCard title="Votre Profil" description="Vos informations personnelles" variant="naked"
            orientation="horizontal" class="mb-4">
            <UButton form="settings" label="Sauvegarder" color="primary" type="submit" class="w-fit lg:ms-auto" />
        </UPageCard>

        <UPageCard variant="subtle">
            <UFormField name="name" label="Nom"
                description="Votre nom complet qui pourra apparaitre dans les informations envoyés à vos clients / fournisseurs"
                required class="flex max-sm:flex-col justify-between items-start gap-4">
                <UInput v-model="formState.fullName" autocomplete="off" />
            </UFormField>
        </UPageCard>
    </UForm>
</template>
