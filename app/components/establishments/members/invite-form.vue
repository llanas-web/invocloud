<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const toast = useToast()
const { inviteMember } = useMembers()


const invitationSchema = z.object({
    email: z.string().email('Invalid email address').min(1, 'Email is required'),
})

const invitationState = reactive({
    email: '',
})

const onSubmit = async (payload: FormSubmitEvent<z.infer<typeof invitationSchema>>) => {
    const { email } = payload.data
    const data = await inviteMember(email)
    if (data) {
        toast.add({
            title: 'Member invited successfully',
            color: 'success',
        })
    } else {
        toast.add({
            title: 'Failed to invite member',
            color: 'error',
        })
    }
}
</script>

<template>
    <UForm id="invite-form" :schema="invitationSchema" :state="invitationState" @submit="onSubmit">
    <UPageCard title="Membres" description="Invitez de nouveaux membres par adresse e-mail." variant="naked"
      orientation="vertical" class="mb-4">
        <UFormField label="Email" placeholder="john.doe@example.com" name="email">
          <UInput v-model="invitationState.email" class="w-full" />
        </UFormField>
        <UButton label="Inviter des personnes" color="neutral" class="w-fit lg:ms-auto" type="submit" />
    </UPageCard>
</UForm>
</template>