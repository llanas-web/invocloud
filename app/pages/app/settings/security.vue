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
      title: 'Votre compte a été supprimé avec succès.',
      color: 'success'
    });
    // Redirect to home or login page
    useRouter().push('/');
  } else {
    useToast().add({
      title: 'Échec de la suppression du compte',
      color: 'error'
    });
  }
}
</script>

<template>
  <UPageCard title="Mot de passe" description="Confirmez votre mot de passe actuel avant d'en définir un nouveau."
    variant="subtle">
    <UForm :schema="passwordSchema" :state="password" :validate="validate" @submit="onSubmit"
      class="flex flex-col gap-4 max-w-xs">
      <UFormField name="new">
        <UInput v-model="password.new" type="password" placeholder="Nouveau mot de passe" class="w-full" />
      </UFormField>

      <UFormField name="newValidation">
        <UInput v-model="password.newValidation" type="password" placeholder="Confirmer le nouveau mot de passe"
          class="w-full" />
      </UFormField>

      <UButton label="Mettre à jour" class="w-fit" type="submit" />
    </UForm>
  </UPageCard>

  <UPageCard title="Compte"
    description="Vous ne souhaitez plus utiliser notre service ? Vous pouvez supprimer votre compte ici. Cette action est irréversible. Toutes les informations liées à ce compte seront définitivement supprimées."
    class="bg-gradient-to-tl from-error/10 from-5% to-default">
    <template #footer>
      <UButton label="Supprimer le compte" color="error" @click="onDeleteAccount" />
    </template>
  </UPageCard>
</template>
