<script setup lang="ts">
  import { EstablishmentsMembersInviteForm } from '#components'

  const { confirm } = useConfirmModal()
  const { selectedEstablishment, deleteEstablishment } = useEstablishments()

  const onDeleteEstablishment = async () => {

    const confirmResult = await confirm({
      title: 'Suppression de l\'établissement',
      description: 'Êtes-vous sûr de vouloir supprimer cet établissement ? Cette action est irréversible.',
      validateLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      danger: true,
    });
    if (!confirmResult) return;
    const response = await deleteEstablishment()
    if (response) {
      useToast().add({
        title: "L'établissement a été supprimé avec succès.",
        color: "success",
      })
      // Redirect to home or establishments list page
    } else {
      useToast().add({
        title: "Échec de la suppression de l'établissement",
        color: "error",
      })
    }
  }
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
      <UPageCard title="Supprimer l'établissement"
        description="Une fois une structure supprimée, toutes ses données seront définitivement supprimées. Avant de supprimer une structure, veuillez vous assurer que vous avez sauvegardé toutes les données importantes."
        class="bg-gradient-to-tl from-error/10 from-5% to-default">
        <template #footer>
          <UButton label="Supprimer l'établissement" color="error" @click="onDeleteEstablishment" />
        </template>
      </UPageCard>
    </template>
  </div>
</template>
