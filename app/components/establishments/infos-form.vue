<script lang="ts" setup>
    const { isAdmin } = useEstablishmentDetails()
    const { formState, onSubmit, pending, checkEmailPrefixAvailable } = useEstablishmentUpdate()
    const errors = ref<string[]>([])
</script>

<template>
    <UForm id="settings" :schema="UpdateEstablishmentSchema" :state="formState" @submit="onSubmit" :disabled="!isAdmin">
        <UPageCard :title="`Informations de la structure`"
            description="Renseignez les informations de votre structure qui se retrouverons dans les emails et les documents générés par InvoCloud"
            variant="naked" orientation="horizontal" class="mb-4">
            <UTooltip v-if="!isAdmin" text="Seul le créateur de la structure peut modifier ces informations."
                :delay-duration="0">
                <UButton form="settings" label="Sauvegarder" color="primary" type="submit" class="w-fit lg:ms-auto"
                    disabled />
            </UTooltip>
            <UButton v-else form="settings" label="Sauvegarder" color="primary" type="submit" class="w-fit lg:ms-auto"
                :disabled="pending || errors.length > 0" />
        </UPageCard>

        <UPageCard variant="subtle">
            <UFormField name="name" label="Nom"
                description="Apparaîtra sur les reçus, factures et autres communications." required
                class="flex max-sm:flex-col justify-between items-start gap-4">
                <UInput v-model="formState.name" autocomplete="off" :disabled="pending" />
            </UFormField>
            <UFormField name="address" label="Adresse" description="Adresse physique de la structure."
                class="flex max-sm:flex-col justify-between items-start gap-4">
                <UInput v-model="formState.address" autocomplete="off" :disabled="pending" />
            </UFormField>
            <UFormField name="phone" label="Téléphone" description="Numéro de téléphone de contact pour la structure."
                class="flex max-sm:flex-col justify-between items-start gap-4">
                <UInput v-model="formState.phone" type="tel" autocomplete="off" :disabled="pending" />
            </UFormField>
            <UFormField name="email_prefix" required :error="false">
                <CommonFormBounceValidatorInput v-model="formState.emailPrefix" name="email_prefix"
                    label="Préfixe email" :action="checkEmailPrefixAvailable"
                    :normalize="(v: string) => v.toLowerCase()" :debounce-ms="350" :required="true"
                    suffix="@in.invocloud.fr" description="Choisissez le préfixe pour recevoir vos factures par email."
                    @checking-change="(checking) => { pending = checking }" msg-taken="Préfix non disponible"
                    @errors-change="(_errors) => { errors = _errors }" />

                <template #error></template>
            </UFormField>
        </UPageCard>
    </UForm>
</template>