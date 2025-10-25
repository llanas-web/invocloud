<script setup lang="ts">
    import * as z from 'zod'
    import type { FormSubmitEvent } from '@nuxt/ui'
    definePageMeta({
        layout: 'auth',
        middleware: ['not-authenticated']
    })

    const { connectedUser, actions } = useAuth();
    const toast = useToast()
    const route = useRoute()

    const loading = ref(false)
    const emailSent = ref(false)
    const routeHash = route.hash

    onMounted(() => {
        if (routeHash) {
            var re = new RegExp("#.*[?&]" + 'error_code' + "=([^&]+)(&|$)");
            var match = routeHash.match(re);
            const errorCode = (match ? match[1] : "");
            if (errorCode === 'otp_expired') {
                toast.add({
                    title: 'Lien expiré',
                    description: 'Le lien de réinitialisation de mot de passe a expiré. Veuillez en demander un nouveau.',
                    color: 'error',
                })
            } else
                toast.add({
                    title: 'Erreur lors de la réinitialisation du mot de passe',
                    description: 'Une erreur est survenue lors de la réinitialisation de votre mot de passe.',
                    color: 'error',
                })
        }
    })

    const fields = [{
        name: 'email',
        type: 'text' as const,
        label: 'E-mail',
        placeholder: 'Entrez votre e-mail',
        required: true
    }]

    const schema = z.object({
        email: z.string().email('Veuillez entrer un email valide'),
    });
    type Schema = z.output<typeof schema>
    const email = ref('')
    async function onSubmit(event: FormSubmitEvent<Schema>) {
        loading.value = true
        try {
            await actions.sendResetPasswordEmail.execute(event.data.email)
            emailSent.value = true
            toast.add({
                title: 'E-mail envoyé',
                description: 'Un e-mail de réinitialisation de mot de passe a été envoyé à votre adresse.',
                color: 'success',
                duration: 5000,
            })
        } catch (error) {
            console.error('Error sending password reset email:', error)
            // Optionally, show an error message to the user
        } finally {
            loading.value = false
        }
    }

</script>

<template>
    <div class="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-32 min-h-full mb-12">
        <div class="flex-1 flex justify-end items-center mx-auto">
            <div class="flex flex-col items-center justify-center gap-4 p-4 max-w-lg">
                <UAuthForm :schema="schema" :fields="fields" :ui="{
                    title: 'text-left text-4xl font-bold text-muted',
                    description: 'text-left text-muted mb-4 font-sans',
                }" :disabled="loading || emailSent" @submit="onSubmit" :submit="{
                    label: 'Envoyer le lien de réinitialisation',
                    loading: loading,
                    color: 'primary',
                    variant: 'solid',
                    disabled: emailSent
                }">
                    <template #title>
                        Réinitialisez votre mot de passe <span class="text-primary">InvoCloud</span>
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