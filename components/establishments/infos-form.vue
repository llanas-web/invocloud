<script lang="ts" setup>
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const { selectedEstablishment, updateEstablishment } = useEstablishments()
const toast = useToast()

const establishmentSchema = z.object({
    name: z.string().min(2, 'Establishment name is required'),
    address: z.string().optional(),
    phone: z.string().optional(),
})

const establishmentState = computed(() => ({
    name: selectedEstablishment.value?.name || '',
    address: selectedEstablishment.value?.address || '',
    phone: selectedEstablishment.value?.phone || '',
}))

const onSubmit = async (payload: FormSubmitEvent<z.infer<typeof establishmentSchema>>) => {
    const { name, address, phone } = payload.data
    const { data, error } = await updateEstablishment({
        name,
        address,
        phone
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
    <UForm id="settings" :schema="establishmentSchema" :state="establishmentState" @submit="onSubmit">
        <UPageCard :title="`Informations de la structure: ${selectedEstablishment?.name}`"
            description="Renseignez les informations de votre structure qui se retrouverons dans les emails et les documents générés par InvoCloud"
            variant="naked" orientation="horizontal" class="mb-4">
            <UButton form="settings" label="Save changes" color="primary" type="submit" class="w-fit lg:ms-auto" />
        </UPageCard>

        <UPageCard variant="subtle">
            <UFormField name="name" label="Name"
                description="Will appear on receipts, invoices, and other communication." required
                class="flex max-sm:flex-col justify-between items-start gap-4">
                <UInput v-model="establishmentState.name" autocomplete="off" />
            </UFormField>
            <UFormField name="address" label="Address" description="Physical address of the establishment."
                class="flex max-sm:flex-col justify-between items-start gap-4">
                <UInput v-model="establishmentState.address" autocomplete="off" />
            </UFormField>
            <UFormField name="phone" label="Phone" description="Contact phone number for the establishment."
                class="flex max-sm:flex-col justify-between items-start gap-4">
                <UInput v-model="establishmentState.phone" type="tel" autocomplete="off" />
            </UFormField>
        </UPageCard>
    </UForm>
</template>