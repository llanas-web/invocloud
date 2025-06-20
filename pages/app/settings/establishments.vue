<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const toast = useToast()

const { selectedEstablishment, updateEstablishment } = useEstablishments()
const { members } = useMembers()

const q = ref('')

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
  <div class="flex flex-col gap-8">
    <UForm id="settings" :schema="establishmentSchema" :state="establishmentState" @submit="onSubmit">
      <UPageCard :title="`Informations de la structure: ${selectedEstablishment?.name}`"
        description="Renseignez les informations de votre structure qui se retrouverons dans les emails et les documents générés par InvoCloud"
        variant="naked" orientation="horizontal" class="mb-4">
        <UButton form="settings" label="Save changes" color="primary" type="submit" class="w-fit lg:ms-auto" />
      </UPageCard>

      <UPageCard variant="subtle">
        <UFormField name="name" label="Name" description="Will appear on receipts, invoices, and other communication."
          required class="flex max-sm:flex-col justify-between items-start gap-4">
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
    <USeparator />

    <UPageCard title="Members" description="Invite new members by email address." variant="naked"
      orientation="horizontal" class="mb-4">
      <UButton label="Invite people" color="neutral" class="w-fit lg:ms-auto" />
    </UPageCard>

    <UPageCard variant="subtle"
      :ui="{ container: 'p-0 sm:p-0 gap-y-0', wrapper: 'items-stretch', header: 'p-4 mb-0 border-b border-default' }">
      <template #header>
        <UInput v-model="q" icon="i-lucide-search" placeholder="Search members" autofocus class="w-full" />
      </template>

      <SettingsMembersList :members="members" />
    </UPageCard>
  </div>
</template>
