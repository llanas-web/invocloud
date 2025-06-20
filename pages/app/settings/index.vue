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
        <UPageCard title="Profile" description="These informations will be displayed publicly." variant="naked"
            orientation="horizontal" class="mb-4">
            <UButton form="settings" label="Save changes" color="primary" type="submit" class="w-fit lg:ms-auto" />
        </UPageCard>

        <UPageCard variant="subtle">
            <UFormField name="name" label="Name"
                description="Will appear on receipts, invoices, and other communication." required
                class="flex max-sm:flex-col justify-between items-start gap-4">
                <UInput v-model="userInformations.fullname" autocomplete="off" />
            </UFormField>
            <USeparator />
            <UFormField name="email" label="Email"
                description="Used to sign in, for email receipts and product updates."
                class="flex max-sm:flex-col justify-between items-start gap-4">
                <UInput v-model="userInformations.email" type="email" autocomplete="off" disabled />
            </UFormField>
        </UPageCard>
    </UForm>
</template>
