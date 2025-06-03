<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: false,
})

const supabase = useSupabaseClient()

const toast = useToast()

const loading = ref(false)

const fields = [{
  name: 'email',
  type: 'text' as const,
  label: 'E-mail',
  placeholder: 'Entrez votre e-mail',
  required: true
}, {
  name: 'password',
  label: 'Mot de passe',
  type: 'password' as const,
  placeholder: 'Entrez votre mot de passe'
}, {
  name: 'remember',
  label: 'Se souvenir de moi',
  type: 'checkbox' as const
}]

const schema = z.object({
  email: z.string().email('E-mail invalide'),
  password: z.string().min(8, 'Doit contenir au moins 8 caractères')
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  loading.value = true
  const { error } = await supabase.auth.signInWithPassword({
    email: payload.data.email,
    password: payload.data.password,
  })
  if (error) toast.add({ title: 'Erreur lors de la connexion', description: error.message, color: 'error' })
  else {
    toast.add({ title: 'Succès', description: 'Connexion réussie', color: 'success' })
    // Redirect to home page
    navigateTo('/app')

  };
  loading.value = false
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4 h-screen">
    <UPageCard class="w-full max-w-md">
      <UAuthForm :schema="schema" title="Connexion à InvoCloud"
        description="Entrez vos identifiants pour accéder à votre compte." icon="i-lucide-send" :fields="fields"
        :disabled="loading" @submit="onSubmit" :submit="{
          label: 'Se connecter',
          loading: loading,
          color: 'primary',
          variant: 'solid'
        }">
        <template #description>
          Vous n'avez pas de compte ? <ULink to="/auth/sign-up" class="text-primary font-medium">Inscrivez-vous</ULink>.
        </template>
        <template #password-hint>
          <ULink to="#" class="text-primary font-medium" tabindex="-1">Mot de passe oublié ?</ULink>
        </template>
        <template #footer>
          En vous connectant, vous acceptez nos <ULink to="#" class="text-primary font-medium">Conditions d'utilisation
          </ULink>.
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
