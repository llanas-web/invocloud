<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { UForm } from '#components'

definePageMeta({
    layout: 'auth',
})

const loading = ref(false)
const { signup } = useAuth()

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
    email: z.string().email('E-mail invalide'),
    password: z.string().min(8, 'Doit contenir au moins 8 caractères'),
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
    full_name: '',
    establishment_name: '',
    email: '',
    password: '',
});

const show = ref(false)
const signUpForm = useTemplateRef('signUpForm')

async function onSubmit(payload: FormSubmitEvent<Schema>) {
    loading.value = true
    const { email, password, full_name, establishment_name } = payload.data
    const data = await signup(
        email,
        password,
        establishment_name,
        full_name,
    )
    loading.value = false
}
</script>

<template>
    <div class="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-32 min-h-full mb-12">
        <div class="flex-1 flex justify-end items-center mx-auto">
            <div class="flex flex-col items-center justify-center gap-4 p-4 max-w-lg">
                <UForm ref="signUpForm" :schema="schema" :state="state" :disabled="loading" @submit="onSubmit">
                    <div class="w-full space-y-6">
                        <div>
                            <h2 class="text-left text-4xl font-bold text-muted">
                                Inscription à <span class="text-primary">InvoCloud</span>
                            </h2>
                            <div class="mt-1 text-left text-muted mb-4 font-sans">
                                Vous avez déjà un compte ?
                                <ULink to="/auth/login" class="text-primary font-medium">
                                    Connectez-vous
                                </ULink>.
                            </div>
                        </div>
                        <div class="flex flex-col gap-y-6">
                            <UFormField v-for="input in fields" :key="input.name" :label="input.label"
                                :name="input.name" :required="input.required" :ui="{ label: 'font-bold' }">
                                <UInput :type="input.type" :placeholder="input.placeholder" v-model="state[input.name]"
                                    variant="outline" class="w-full" color="primary">
                                    <template v-if="input.type === 'password'" #trailing>
                                        <UButton color="neutral" variant="link" size="sm"
                                            :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                                            :aria-label="show ? 'Hide password' : 'Show password'" :aria-pressed="show"
                                            aria-controls="password" @click="show = !show" />
                                    </template>
                                </UInput>
                            </UFormField>
                        </div>
                    </div>
                </UForm>
            </div>
        </div>
        <div class="flex-1 flex justify-start items-center mx-auto">
            <div class="max-w-lg flex flex-col items-center justify-center gap-4">
                <UCard variant="soft" class="w-full bg-primary-50 lg:rounded-3xl lg:px-16 lg:py-6">
                    <div class="flex flex-col gap-2 text-muted font-sans font-medium">
                        Profitez de l'abonnement Invocloud avec
                        <span class="text-primary font-bold text-2xl lg:text-4xl">7 jours gratuits</span>
                        <span class="text-primary">Puis 29,99€ / mois</span>
                    </div>
                </UCard>
                <USeparator />
                <UButton class="w-full justify-center py-3 cursor-pointer" label="Démarrer la période d'essai"
                    @click="() => signUpForm?.submit()" />
                <span class="text-center text-sm text-muted">Si vous n’annulez pas votre essai avant les 7 jours, un
                    montant de
                    29,99€ vous
                    sera
                    facturé par
                    mois à
                    compter du 31 juillet 2025</span>
            </div>
        </div>
    </div>
</template>
