<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { AuthUserModel } from '~~/shared/application/common/providers/auth/dto/auth.dto'

definePageMeta({
    layout: 'auth',
})
const config = useRuntimeConfig()
// get plan from query params
const route = useRoute()
const plan = route.query.plan as 'starter' | 'pro' | undefined

const { connectedUser, isWaitingForCheckout, actions: { signup } } = useAuth()

const fields: Array<{
    name: keyof Schema
    type: 'text' | 'email' | 'password'
    label: string
    placeholder: string
    required?: boolean
}> = [
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
    email: z.email('E-mail invalide'),
    password: z.string().min(8, 'Doit contenir au moins 8 caractères'),
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
    full_name: '',
    establishment_name: '',
    email: '',
    password: '',
});

async function onSubmit(payload: FormSubmitEvent<Schema>) {
    const { email, password, full_name, establishment_name } = payload.data
    await signup.execute(
        email,
        password,
        establishment_name,
        full_name,
        plan,
    )
}


useSeoMeta({
    title: 'Inscription - Invocloud',
    titleTemplate: 'Inscription - Invocloud',
    description: 'Inscrivez-vous à votre compte Invocloud',
    ogType: 'website',
    ogLocale: 'fr_FR',
    ogSiteName: 'Invocloud',
    ogTitle: 'Inscription - Invocloud',
    ogDescription: 'Inscrivez-vous à votre compte Invocloud',
    ogUrl: `${config.public.baseUrl ?? 'https://invocloud.fr'}/auth/sign-up`,
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
                <template v-if="connectedUser != null">
                    <div class="w-full space-y-6">
                        <div>
                            <h2 class="text-left text-4xl font-bold text-muted">
                                Bonjour <span class="text-primary">
                                    {{ (connectedUser as AuthUserModel).email }}</span>
                            </h2>
                            <div class="mt-1 text-left text-muted mb-4 font-sans">
                                Terminez votre inscription à <span class="text-primary">
                                    Invocloud
                                </span>
                            </div>
                            <template v-if="isWaitingForCheckout">
                                <div class="p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
                                    <UIcon name="i-lucide-loader" class="inline-block w-5 h-5 mr-2 animate-spin" />
                                    Création de votre session de paiement...
                                </div>
                            </template>
                        </div>
                    </div>
                </template>
                <UAuthForm v-else ref="signUpForm" :schema="schema" :state="state" :fields="fields"
                    :disabled="signup.pending.value" @submit="onSubmit" :ui="{
                        title: 'text-left text-4xl font-bold text-muted',
                        description: 'text-left text-muted mb-4 font-sans',
                    }">
                    <template #title>
                        Inscription à <span class="text-primary">InvoCloud</span>
                    </template>
                    <template #description>
                        Vous avez déjà un compte ?
                        <ULink to="/auth/login" class="text-primary font-medium">
                            Connectez-vous
                        </ULink>.
                    </template>
                    <template #footer>
                        En vous inscrivant, vous acceptez nos
                        <NuxtLink to="/cgu" class="text-primary font-medium">
                            Conditions d'utilisation
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
