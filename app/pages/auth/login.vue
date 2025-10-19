<script setup lang="ts">
  import * as z from 'zod'
  import type { FormSubmitEvent } from '@nuxt/ui'

  definePageMeta({
    layout: 'auth',
    middleware: ['not-authenticated']
  })
  const config = useRuntimeConfig()

  const { login } = useAuth()
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
    await login(payload.data.email, payload.data.password)
    loading.value = false
  }

  useSeoMeta({
    title: 'Connexion - Invocloud',
    titleTemplate: 'Connexion - Invocloud',
    description: 'Connectez-vous à votre compte Invocloud',
    ogType: 'website',
    ogLocale: 'fr_FR',
    ogSiteName: 'Invocloud',
    ogTitle: 'Connexion - Invocloud',
    ogDescription: 'Connectez-vous à votre compte Invocloud',
    ogUrl: `${config.public.baseUrl ?? 'https://invocloud.fr'}/auth/login`,
    ogImage: `${config.public.baseUrl}/thumbnail_1200.png`,
    ogImageAlt: 'Invocloud - Gérer vos factures en toute simplicité',
    ogImageHeight: 577,
    ogImageWidth: 1200,
    twitterCard: 'summary_large_image',
    twitterImage: `${config.public.baseUrl}/thumbnail_1200.png`,
    twitterImageAlt: 'Invocloud - Gérer vos factures en toute simplicité',
  })
</script>

<template>
  <div class="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-32 min-h-full mb-12">
    <div class="flex-1 flex justify-end items-center mx-auto">
      <div class="flex flex-col items-center justify-center gap-4 p-4 max-w-lg">
        <UAuthForm :schema="schema" :fields="fields" :ui="{
          title: 'text-left text-4xl font-bold text-muted',
          description: 'text-left text-muted mb-4 font-sans',
        }" :disabled="loading" @submit="onSubmit" :submit="{
          label: 'Connexion',
          loading: loading,
          color: 'primary',
          variant: 'solid'
        }">
          <template #title>
            Connexion à <span class="text-primary">InvoCloud</span>
          </template>
          <template #description>
            Vous n'avez pas de compte ? <ULink to="/auth/sign-up" class="text-primary font-medium">Inscrivez-vous
            </ULink>.
          </template>
          <template #password-hint>
            <ULink to="/auth/forgot-password" class="text-primary font-medium" tabindex="-1">Mot de passe oublié ?
            </ULink>
          </template>
          <template #footer>
            En vous connectant, vous acceptez nos <NuxtLink to="/cgu" class="text-primary font-medium">Conditions
              d'utilisation
            </NuxtLink>.
          </template>
        </UAuthForm>
      </div>
    </div>
    <div class="hidden lg:flex flex-1 justify-start items-center mx-auto">
      <CommonInvocloudLogo />
    </div>
  </div>
</template>
