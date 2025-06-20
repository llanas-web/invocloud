<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, FormError } from '@nuxt/ui'

const { resetPassword } = useAuth()
const { deleteAccount } = useUser()

const passwordSchema = z.object({
  new: z.string().min(8, 'Must be at least 8 characters'),
  newValidation: z.string().min(8, 'Must be at least 8 characters')
})

type PasswordSchema = z.output<typeof passwordSchema>

const password = reactive<Partial<PasswordSchema>>({
  new: undefined,
  newValidation: undefined
})

const validate = (state: Partial<PasswordSchema>): FormError[] => {
  const errors: FormError[] = []
  if (state?.new !== state?.newValidation) {
    errors.push({ name: 'newValidation', message: 'Passwords must be the same' })
  }
  return errors
}

const onSubmit = async (payload: FormSubmitEvent<z.infer<typeof passwordSchema>>) => {
  const { new: newPassword } = payload.data;
  const response = await resetPassword(newPassword);
}

const onDeleteAccount = async () => {
  const response = await deleteAccount();
  if (response) {
    useToast().add({
      title: 'Account deleted successfully',
      color: 'success'
    });
    // Redirect to home or login page
    useRouter().push('/');
  } else {
    useToast().add({
      title: 'Failed to delete account',
      color: 'error'
    });
  }
}
</script>

<template>
  <UPageCard title="Password" description="Confirm your current password before setting a new one." variant="subtle">
    <UForm :schema="passwordSchema" :state="password" :validate="validate" @submit="onSubmit"
      class="flex flex-col gap-4 max-w-xs">
      <UFormField name="new">
        <UInput v-model="password.new" type="password" placeholder="New password" class="w-full" />
      </UFormField>

      <UFormField name="newValidation">
        <UInput v-model="password.newValidation" type="password" placeholder="Confirm new password" class="w-full" />
      </UFormField>

      <UButton label="Update" class="w-fit" type="submit" />
    </UForm>
  </UPageCard>

  <UPageCard title="Account"
    description="No longer want to use our service? You can delete your account here. This action is not reversible. All information related to this account will be deleted permanently."
    class="bg-gradient-to-tl from-error/10 from-5% to-default">
    <template #footer>
      <UButton label="Delete account" color="error" @click="onDeleteAccount" />
    </template>
  </UPageCard>
</template>
