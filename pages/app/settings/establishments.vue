<script setup lang="ts">
import { EstablishmentsMembersInviteForm } from '#components'


const toast = useToast()

const { selectedEstablishment, updateEstablishment } = useEstablishments()
const { members } = useMembers()

const q = ref('')

</script>

<template>
  <div class="flex flex-col gap-8">
    <EstablishmentsInfosForm />
    <USeparator />
    <EstablishmentsMembersInviteForm />
    <UPageCard variant="subtle"
      :ui="{ container: 'p-0 sm:p-0 gap-y-0', wrapper: 'items-stretch', header: 'p-4 mb-0 border-b border-default' }">
      <template #header>
        <UInput v-model="q" icon="i-lucide-search" placeholder="Rechercher des membres" autofocus class="w-full" />
      </template>

      <SettingsMembersList :members="members" />
    </UPageCard>
  </div>
</template>
