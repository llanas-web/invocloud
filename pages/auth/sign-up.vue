<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { separator } from '#build/ui'

definePageMeta({
    layout: false,
})

const loading = ref(false)
const { signup } = useAuth()

const fields = [
    {
        name: 'email',
        type: 'text' as const,
        label: 'E-mail',
        placeholder: 'Entrez votre e-mail',
        required: true,
    },
    {
        name: 'password',
        label: 'Mot de passe',
        type: 'password' as const,
        placeholder: 'Entrez votre mot de passe',
        required: true,
    },
    {
        name: 'full_name',
        type: 'text' as const,
        label: 'Nom complet',
        placeholder: 'Entrez votre nom complet',
        required: true,
    },
    {
        name: 'establishment_name',
        type: 'text' as const,
        label: 'Nom de la structure',
        placeholder: 'Entrez le nom de la structure',
        required: true,
    },
];

const schema = z.object({
    full_name: z.string().min(2, 'Nom trop court'),
    establishment_name: z.string().min(2, 'Nom de structure requis'),
    email: z.string().email('E-mail invalide'),
    password: z.string().min(8, 'Doit contenir au moins 8 caractères'),
})

type Schema = z.output<typeof schema>

const isSignUpSuccessful = ref(false)

async function onSubmit(payload: FormSubmitEvent<Schema>) {
    loading.value = true
    const { email, password, full_name, establishment_name } = payload.data
    const data = await signup(
        email,
        password,
        establishment_name,
        full_name,
    )
    if (data) isSignUpSuccessful.value = true
    loading.value = false
}
</script>

<template>
    <div class="flex flex-col items-center justify-center gap-4 p-4 h-screen">
        <UPageCard class="w-full max-w-md">
            <template v-if="isSignUpSuccessful">
                <div class="text-center">
                    <h2 class="text-2xl font-bold">Vérifiez votre e-mail</h2>
                    <p class="mt-2 text-gray-600">
                        Nous vous avons envoyé un e-mail de confirmation. Veuillez vérifier votre boîte de réception
                        pour confirmer votre compte.
                    </p>
                </div>
            </template>
            <template v-else>
                <UAuthForm :schema="schema" title="Inscription à InvoCloud"
                    description="Entrez vos informations pour créer votre compte." icon="i-lucide-send" :fields="fields"
                    :disabled="loading" @submit="onSubmit" :submit="{
                        label: 'S\'inscrire', loading: loading,
                    }">
                    <template #description>
                        Vous avez déjà un compte ?
                        <ULink to="/auth/login" class="text-primary font-medium">
                            Connectez-vous
                        </ULink>.
                    </template>
                    <template #footer>
                        En vous inscrivant, vous acceptez nos
                        <ULink to="#" class="text-primary font-medium">
                            Conditions d'utilisation
                        </ULink>.
                    </template>
                </UAuthForm>
            </template>
        </UPageCard>
    </div>
</template>
