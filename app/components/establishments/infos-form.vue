<script lang="ts" setup>
    import * as z from 'zod'
    import type { FormSubmitEvent } from '@nuxt/ui'

    const { selectedEstablishment, updateEstablishment } = useEstablishments()
    const { currentUser } = useUser()
    const toast = useToast()

    const establishmentSchema = z.object({
        name: z.string().min(2, 'Establishment name is required'),
        address: z.string().optional(),
        phone: z.string().optional(),
        email_prefix: z.string().min(2, 'Email prefix is required'),
    })

    const establishmentState = computed(() => ({
        name: selectedEstablishment.value?.name || '',
        address: selectedEstablishment.value?.address || '',
        phone: selectedEstablishment.value?.phone || '',
        email_prefix: selectedEstablishment.value?.email_prefix || '',
    }))

    const isAdmin = computed(() => selectedEstablishment.value?.creator_id === currentUser.value?.id)

    const onSubmit = async (payload: FormSubmitEvent<z.infer<typeof establishmentSchema>>) => {
        const { name, address, phone, email_prefix } = payload.data
        const { data, error } = await updateEstablishment({
            name,
            address,
            phone,
            email_prefix: email_prefix,
        })
        if (data) {
            toast.add({
                title: 'Establishment updated successfully',
                color: 'success',
            })
        } else {
            toast.add({
                title: 'Failed to update establishment',
                color: 'error',
            })
        }
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
            <UButton v-else form="settings" label="Sauvegarder" color="primary" type="submit"
                class="w-fit lg:ms-auto" />
        </UPageCard>

        <UPageCard variant="subtle">
            <UFormField name="name" label="Nom"
                description="Apparaîtra sur les reçus, factures et autres communications." required
                class="flex max-sm:flex-col justify-between items-start gap-4">
                <UInput v-model="establishmentState.name" autocomplete="off" />
            </UFormField>
            <UFormField name="address" label="Adresse" description="Adresse physique de la structure."
                class="flex max-sm:flex-col justify-between items-start gap-4">
                <UInput v-model="establishmentState.address" autocomplete="off" />
            </UFormField>
            <UFormField name="phone" label="Téléphone" description="Numéro de téléphone de contact pour la structure."
                class="flex max-sm:flex-col justify-between items-start gap-4">
                <UInput v-model="establishmentState.phone" type="tel" autocomplete="off" />
            </UFormField>
            <UFormField name="email_prefix" label="Préfixe email"
                description="Le préfixe email permet de recevoir des factures par email" required
                class="flex max-sm:flex-col justify-between items-start gap-4">
                <UInput v-model="establishmentState.email_prefix" autocomplete="off" />
            </UFormField>
        </UPageCard>
    </UForm>
</template>