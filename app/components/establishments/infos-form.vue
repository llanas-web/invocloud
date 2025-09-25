<script lang="ts" setup>
    import * as z from 'zod'
    import type { FormError, FormSubmitEvent } from '@nuxt/ui'
    import { useDebounceFn } from '@vueuse/core'

    const { selectedEstablishment, updateEstablishment, isEmailPrefixAvailable } = useEstablishments()
    const { currentUser } = useUser()
    const loading = ref(false)
    const toast = useToast()

    const establishmentSchema = z.object({
        name: z.string().min(2, 'Le nom de la structure est requis'),
        address: z.string().optional(),
        phone: z.string().optional(),
        email_prefix: z.string()
            .min(2, 'Le préfixe email est requis')
            .regex(/^[a-z0-9]+([-_][a-z0-9]+)*$/, 'Caractères autorisés : a-z, 0-9, - et _'),
    })

    const establishmentState = computed(() => ({
        name: selectedEstablishment.value?.name || '',
        address: selectedEstablishment.value?.address || '',
        phone: selectedEstablishment.value?.phone || '',
        email_prefix: selectedEstablishment.value?.email_prefix || '',
    }))

    // Async validator: calls your RPC
    const checkPrefix = async (value: string) => {
        const isValid = await isEmailPrefixAvailable(value)
        return isValid ? { ok: true } : { ok: false, message: "Ce préfixe est déjà pris" }
    }

    const isAdmin = computed(() => selectedEstablishment.value?.creator_id === currentUser.value?.id)

    const onSubmit = async (payload: FormSubmitEvent<z.infer<typeof establishmentSchema>>) => {
        loading.value = true
        const { name, address, phone, email_prefix } = payload.data
        const { data, error } = await updateEstablishment({
            name,
            address,
            phone,
            email_prefix: email_prefix,
        })
        if (data) {
            toast.add({
                title: 'Etablissement mis à jour avec succès',
                color: 'success',
            })
        } else {
            toast.add({
                title: 'Échec de la mise à jour de l\'établissement',
                color: 'error',
            })
        }
        loading.value = false
    }
</script>

<template>
    <UForm id="settings" :schema="establishmentSchema" :state="establishmentState" @submit="onSubmit"
        :disabled="!isAdmin">
        <UPageCard :title="`Informations de la structure`"
            description="Renseignez les informations de votre structure qui se retrouverons dans les emails et les documents générés par InvoCloud"
            variant="naked" orientation="horizontal" class="mb-4">
            <UTooltip v-if="!isAdmin" text="Seul le créateur de la structure peut modifier ces informations."
                :delay-duration="0">
                <UButton form="settings" label="Sauvegarder" color="primary" type="submit" class="w-fit lg:ms-auto"
                    disabled />
            </UTooltip>
            <UButton v-else form="settings" label="Sauvegarder" color="primary" type="submit" class="w-fit lg:ms-auto"
                :disabled="loading" />
        </UPageCard>

        <UPageCard variant="subtle">
            <UFormField name="name" label="Nom"
                description="Apparaîtra sur les reçus, factures et autres communications." required
                class="flex max-sm:flex-col justify-between items-start gap-4">
                <UInput v-model="establishmentState.name" autocomplete="off" :disabled="loading" />
            </UFormField>
            <UFormField name="address" label="Adresse" description="Adresse physique de la structure."
                class="flex max-sm:flex-col justify-between items-start gap-4">
                <UInput v-model="establishmentState.address" autocomplete="off" :disabled="loading" />
            </UFormField>
            <UFormField name="phone" label="Téléphone" description="Numéro de téléphone de contact pour la structure."
                class="flex max-sm:flex-col justify-between items-start gap-4">
                <UInput v-model="establishmentState.phone" type="tel" autocomplete="off" :disabled="loading" />
            </UFormField>
            <UFormField name="email_prefix" required :error="false">
                <CommonFormBounceValidatorInput v-model="establishmentState.email_prefix" name="email_prefix"
                    label="Préfixe email" :async-validate="checkPrefix" :normalize="(v: string) => v.toLowerCase()"
                    :debounce-ms="350" :required="true" suffix="@in.invocloud.fr"
                    description="Choisissez le préfixe pour recevoir vos factures par email."
                    @checking-change="(checking) => { loading = checking }" />
                <template #error></template>
            </UFormField>
        </UPageCard>
    </UForm>
</template>