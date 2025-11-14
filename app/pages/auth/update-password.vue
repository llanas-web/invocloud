<script setup lang="ts">
    import * as z from 'zod'
    import type { FormError, FormSubmitEvent } from '@nuxt/ui'

    definePageMeta({
        layout: 'auth',
    })

    const { actions: { resetPassword } } = useAuth()
    const route = useRoute()

    const { error, error_code, error_description } = route.query
    if (error) {
        console.error('Error during password reset:', { error, error_code, error_description })
        await navigateTo('/auth/forgot-password')
    }


    const fields = [{
        name: 'new',
        type: 'password' as const,
        label: 'Nouveau mot de passe',
        placeholder: 'Entrez votre nouveau mot de passe',
        required: true
    }, {
        name: 'newValidation',
        type: 'password' as const,
        label: 'Confirmez le nouveau mot de passe',
        placeholder: 'Confirmez votre nouveau mot de passe',
        required: true
    }]

    const passwordSchema = z.object({
        new: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
        newValidation: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    })

    type PasswordSchema = z.output<typeof passwordSchema>

    const password = reactive<Partial<PasswordSchema>>({
        new: undefined,
        newValidation: undefined
    })

    const loading = computed(() => resetPassword.pending.value)

    const validate = (state: Partial<PasswordSchema>): FormError[] => {
        const errors: FormError[] = []
        if (state?.new !== state?.newValidation) {
            errors.push({ name: 'newValidation', message: 'Les mots de passe doivent être identiques' })
        }
        return errors
    }

    const onSubmit = async (payload: FormSubmitEvent<z.infer<typeof passwordSchema>>) => {
        const { new: newPassword } = payload.data;
        await resetPassword.execute(newPassword);
        await navigateTo('/auth/login');
    }
</script>

<template>
    <div class="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-32 min-h-full mb-12">
        <div class="flex-1 flex justify-end items-center mx-auto">
            <div class="flex flex-col items-center justify-center gap-4 p-4 max-w-lg">
                <UAuthForm :schema="passwordSchema" :state="password" :fields="fields" :validate="validate"
                    @submit="onSubmit" :ui="{
                        title: 'text-left text-4xl font-bold text-muted',
                        description: 'text-left text-muted mb-4 font-sans',
                    }" :disabled="loading" :submit="{
                        label: 'Réinitialiser',
                        loading: loading,
                        color: 'primary',
                        variant: 'solid'
                    }">
                    <template #title>
                        Changez votre mot de passe <span class="text-primary">InvoCloud</span>
                    </template>
                    <template #description>
                        Vous n'avez pas de compte ? <ULink to="/auth/sign-up" class="text-primary font-medium">
                            Inscrivez-vous
                        </ULink>.
                    </template>
                </UAuthForm>
            </div>
        </div>
        <div class="hidden lg:flex flex-1 justify-start items-center mx-auto">
            <CommonInvocloudLogo />
        </div>
    </div>
</template>