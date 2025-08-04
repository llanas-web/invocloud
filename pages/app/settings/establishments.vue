<script setup lang="ts">
import { EstablishmentsMembersInviteForm } from '#components'

const { selectedEstablishment } = useEstablishments()

</script>

<template>
  <div class="flex flex-col gap-8">
    <EstablishmentsMenuSelector />
    <template v-if="!selectedEstablishment">
      <UPageCard title="Sélectionnez une structure"
        description="Veuillez sélectionner une structure pour modifier ses informations." variant="naked" />
    </template>
    <template v-else>
      <EstablishmentsInfosForm />
      <USeparator />
      <EstablishmentsBillingSubscription />
      <USeparator />
      <EstablishmentsMembersInviteForm />
      <EstablishmentsMembersList />
    </template>
  </div>
</template>
