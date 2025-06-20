<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const toast = useToast()

const open = ref(false)

const { pending } = useEstablishments()

const links = ref<NavigationMenuItem[]>([
    {
        label: 'Accueil',
        icon: 'i-lucide-house',
        to: '/app',
        onSelect: () => {
            open.value = false
        }
    }, {
        label: 'Factures',
        icon: 'i-lucide-files',
        to: '/app/invoices',
        slot: 'invoices',
        onSelect: () => {
            open.value = false
        }
    }, {
        label: 'Fournisseurs',
        icon: 'i-lucide-users',
        to: '/app/suppliers',
        onSelect: () => {
            open.value = false
        }
    },
    {
        label: 'Settings',
        to: '/app/settings',
        icon: 'i-lucide-settings',
        defaultOpen: false,
        type: 'trigger',
        children: [{
            label: 'General',
            to: '/app/settings',
            exact: true,
            onSelect: () => {
                open.value = false
            }
        }, {
            label: 'Members',
            to: '/app/settings/members',
            onSelect: () => {
                open.value = false
            }
        }, {
            label: 'Notifications',
            to: '/app/settings/notifications',
            onSelect: () => {
                open.value = false
            }
        }, {
            label: 'Security',
            to: '/app/settings/security',
            onSelect: () => {
                open.value = false
            }
        }],
    },
])

onMounted(async () => {
    const cookie = useCookie('cookie-consent')
    if (cookie.value === 'accepted') {
        return
    }

    toast.add({
        title: 'We use first-party cookies to enhance your experience on our website.',
        duration: 0,
        close: false,
        actions: [{
            label: 'Accept',
            color: 'neutral',
            variant: 'outline',
            onClick: () => {
                cookie.value = 'accepted'
            }
        }, {
            label: 'Opt out',
            color: 'neutral',
            variant: 'ghost'
        }]
    })
})
</script>

<template>
    <UDashboardGroup unit="rem">
        <UDashboardSidebar id="default" v-model:open="open" collapsible resizable class="bg-elevated/25"
            :ui="{ footer: 'lg:border-t lg:border-default' }">
            <template #header="{ collapsed }">
                <EstablishmentsMenuSelector :collapsed="collapsed" />
            </template>

            <template #default="{ collapsed }">
                <UNavigationMenu :collapsed="collapsed" :items="links" orientation="vertical">
                    <!-- <template #invoices-trailing>
                        <UTooltip :text="`You have ${pendingInvoices.length ?? 0} pending invoices`" placement="right">
                            <UBadge :label="`${pendingInvoices.length}`" size="sm"
                                :color="pendingInvoices.length ? 'primary' : 'neutral'" />
                        </UTooltip>
                    </template> -->
                </UNavigationMenu>
            </template>
            <template #footer="{ collapsed }">
                <UserMenu :collapsed="collapsed" />
            </template>
        </UDashboardSidebar>

        <template v-if="!pending">
            <slot />
        </template>

        <!-- <NotificationsSlideover /> -->
    </UDashboardGroup>
</template>
