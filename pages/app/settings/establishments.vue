<script setup lang="ts">
import { EstablishmentsMembersInviteForm } from '#components'


</script>

<template>
  <div class="flex flex-col gap-8">
    <EstablishmentsInfosForm />
    <USeparator />
    <EstablishmentsBillingSubscription />
    <USeparator />
    <EstablishmentsMembersInviteForm />
    <EstablishmentsMembersList />
  </div>
</template>
