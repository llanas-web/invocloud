<script setup lang="ts">
const user = useSupabaseUser()

definePageMeta({
  layout: false,
})

watch(user, () => {
  if (user.value) {
    // Redirect to protected page
    return navigateTo('/app')
  }
}, { immediate: true })
</script>

<template>
  <div>En attente de validation d'email...</div>
</template>
