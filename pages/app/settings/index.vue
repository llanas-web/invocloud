<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const { currentUser, updateUser, refresh } = useUser();

const userSchema = z.object({
    fullname: z.string().min(2, 'Too short'),
    email: z.string().email('Invalid email'),
})

const userInformations = computed(() => ({
    fullname: currentUser.value?.full_name || '',
    email: currentUser.value?.email || '',
}))

const onSubmit = async (payload: FormSubmitEvent<z.infer<typeof userSchema>>) => {
    try {
        await updateUser({
            full_name: payload.data.fullname,
        })
    } catch (err) {
        console.error('Error updating user information:', err)
    }
}
</script>

<template>
    <UForm id="settings" :schema="userSchema" :state="userInformations" @submit="onSubmit">
        <UPageCard title="Votre Profil" description="Vos informations personnelles" variant="naked"
            orientation="horizontal" class="mb-4">
            <UButton form="settings" label="Sauvegarder" color="primary" type="submit" class="w-fit lg:ms-auto" />
        </UPageCard>

        <UPageCard variant="subtle">
            <UFormField name="name" label="Nom"
                description="Votre nom complet qui pourra apparaitre dans les informations envoyés à vos clients / fournisseurs"
                required class="flex max-sm:flex-col justify-between items-start gap-4">
                <UInput v-model="userInformations.fullname" autocomplete="off" />
            </UFormField>
            <USeparator />
            <UFormField name="email" label="Email"
                description="Utilisé pour se connecter, pour les reçus par e-mail et les mises à jour de produits."
                class="flex max-sm:flex-col justify-between items-start gap-4">
                <UInput v-model="userInformations.email" type="email" autocomplete="off" disabled />
            </UFormField>
        </UPageCard>
    </UForm>
</template>
