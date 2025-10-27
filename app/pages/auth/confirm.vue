<script setup lang="ts">
  const { isAuthenticated } = useAuth();

  definePageMeta({
    layout: false,
  })

  watch(isAuthenticated, () => {
    if (isAuthenticated.value) {
      // Redirect to protected page
      return navigateTo('/app')
    }
  }, { immediate: true })
</script>

<template>
  <div>En attente de validation d'email...</div>
</template>
