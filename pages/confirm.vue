<script setup lang="ts">
const user = useSupabaseUser()

definePageMeta({
  layout: false,
})

watch(user, () => {
  if (user.value) {
    // Redirect to protected page
    return navigateTo('/')
  }
}, { immediate: true })
</script>

<template>
  <div>Waiting for login...</div>
</template>
