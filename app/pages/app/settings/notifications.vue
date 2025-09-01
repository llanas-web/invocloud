<script setup lang="ts">
const state = reactive<{ [key: string]: boolean }>({
  email: true,
  desktop: false,
  product_updates: true,
  weekly_digest: false,
  important_updates: true
})

const sections = [{
  title: 'Notifications',
  description: 'Ou pouvons nous vous notifier ?',
  fields: [{
    name: 'email',
    label: 'Email',
    description: 'Recevez un résumé quotidien par e-mail.'
  },]
}, {
  title: 'Mises à jour du produit',
  description: 'Recevez des mises à jour sur Invocloud.',
  fields: [{
    name: 'product_updates',
    label: 'Mises à jour du produit',
    description: 'Recevez un e-mail mensuel avec toutes les nouvelles fonctionnalités et mises à jour.'
  }, {
    name: 'important_updates',
    label: 'Mises à jour importantes',
    description: 'Recevez des e-mails concernant des mises à jour importantes telles que des corrections de sécurité, de la maintenance, etc.'
  }]
}]

async function onChange() {
  // Do something with data
  console.log(state)
}
</script>

<template>
  <div v-for="(section, index) in sections" :key="index">
    <UPageCard :title="section.title" :description="section.description" variant="naked" class="mb-4" />

    <UPageCard variant="subtle" :ui="{ container: 'divide-y divide-default' }">
      <UFormField v-for="field in section.fields" :key="field.name" :name="field.name" :label="field.label"
        :description="field.description" class="flex items-center justify-between not-last:pb-4 gap-2">
        <USwitch v-model="state[field.name]" @update:model-value="onChange" />
      </UFormField>
    </UPageCard>
  </div>
</template>
