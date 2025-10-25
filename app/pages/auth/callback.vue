<script lang="ts" setup>
  import { UCard } from '#components';
  import type { AuthUserModel } from '~~/shared/application/common/providers/auth/dto/auth.dto';

  const { connectedUser } = useAuth();

  definePageMeta({
    layout: 'auth',
  })
</script>

<template>
  <div class="flex justify-center items-center h-full">
    <UCard>
      <template #header>
        <h1 class="text-2xl font-bold">🎉 Félicitations !</h1>
      </template>
      <h2 class="text-xl font-semibold mb-4">Bienvenue sur Invocloud {{ (connectedUser as AuthUserModel).email }}</h2>
      <p>Votre compte a été vérifié avec succès.</p>
      <p>Vous pouvez maintenant vous connecter à votre compte.</p>
      <template #footer>
        <div class="flex justify-end">
          <UButton class="ml-auto" color="primary" label="Se connecter" to="/auth/login"></UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>