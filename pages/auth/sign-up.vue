<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
    layout: false,
})

const supabase = useSupabaseClient()

const toast = useToast()
const config = useRuntimeConfig()
const redirectTo = `${config.public.baseUrl}/auth/callback`

const fields = [{
    name: 'email',
    type: 'text' as const,
    label: 'Email',
    placeholder: 'Enter your email',
    required: true
}, {
    name: 'password',
    label: 'Password',
    type: 'password' as const,
    placeholder: 'Enter your password'
}];

const schema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Must be at least 8 characters'),
})

type Schema = z.output<typeof schema>


// Variable réactive pour suivre l'état de la soumission
const isSignUpSuccessful = ref(false)

async function onSubmit(payload: FormSubmitEvent<Schema>) {
    const { error } = await supabase.auth.signUp({
        email: payload.data.email,
        password: payload.data.password,
        options: {
            emailRedirectTo: redirectTo
        },
    })
    if (error) toast.add({ title: 'Error while signIn', description: error.message, color: 'error' })
    else {
        toast.add({ title: 'Success', description: 'Logged in successfully', color: 'success' })
        isSignUpSuccessful.value = true
    };
}
</script>

<template>
    <div class="flex flex-col items-center justify-center gap-4 p-4 h-screen">
        <UPageCard class="w-full max-w-md">
            <template v-if="isSignUpSuccessful">
                <div class="text-center">
                    <h2 class="text-2xl font-bold">Check your email</h2>
                    <p class="mt-2 text-gray-600">We have sent you a confirmation email. Please check your inbox to
                        confirm your account.</p>
                </div>
            </template>
            <template v-else>
                <UAuthForm :schema="schema" title="Register to InvoCloud"
                    description="Enter your credentials to create your account." icon="i-lucide-user" :fields="fields"
                    @submit="onSubmit">
                    <template #description>
                        Already have an account? <ULink to="/auth/login" class="text-primary font-medium">Login</ULink>.
                    </template>
                    <template #footer>
                        By signing in, you agree to our <ULink to="#" class="text-primary font-medium">Terms of Service
                        </ULink>.
                    </template>
                </UAuthForm>
            </template>
        </UPageCard>
    </div>
</template>
