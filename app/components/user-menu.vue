<script setup lang="ts">
  import type { DropdownMenuItem } from '@nuxt/ui'

  defineProps<{
    collapsed?: boolean
  }>()

  const router = useRouter();
  const currentRoute = router.currentRoute;
  const supabaseUser = useSupabaseUser()
  const { logout } = useAuth()

  const user = ref({
    name: supabaseUser.value?.email,
  })

  const items = computed<DropdownMenuItem[][]>(() => ([[{
    type: 'label',
    label: user.value.name,
  }], [{
    label: 'Profil',
    icon: 'i-lucide-user'
  }, {
    label: 'Paiements',
    icon: 'i-lucide-credit-card',
    to: '/app/settings/establishments#billing',
    active: currentRoute.value.name === 'app-settings-establishments'
  }, {
    label: 'Paramètres',
    icon: 'i-lucide-settings',
    to: '/app/settings',
    active: currentRoute.value.name === 'app-settings'
  }],
  [{
    label: 'Déconnexion',
    icon: 'i-lucide-log-out',
    onSelect: logout
  }],
  ]))
</script>

<template>
  <UDropdownMenu :items="items" :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }">
    <UButton v-bind="{
      ...user,
      label: collapsed ? undefined : user?.name,
      trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down'
    }" color="neutral" variant="ghost" block :square="collapsed" class="data-[state=open]:bg-elevated" :ui="{
      trailingIcon: 'text-dimmed'
    }" />

    <template #chip-leading="{ item }">
      <span :style="{
        '--chip-light': `var(--color-${(item as any).chip}-500)`,
        '--chip-dark': `var(--color-${(item as any).chip}-400)`
      }" class="ms-0.5 size-2 rounded-full bg-(--chip-light) dark:bg-(--chip-dark)" />
    </template>
  </UDropdownMenu>
</template>
