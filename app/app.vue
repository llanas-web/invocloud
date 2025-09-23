<script setup lang="ts">
  import { LazyCommonConfirmModal } from '#components';
  import { fr } from '@nuxt/ui/locale'
  import { Analytics } from '@vercel/analytics/nuxt';
</script>

<template>
  <Analytics />
  <UApp :locale="fr">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
