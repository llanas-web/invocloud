<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { LazyInvoicesUploadModalContainer } from '#components'

const route = useRoute()

// get the subscription_success from the query params
const subscriptionSuccess = route.query.subscription_success === 'true'
const toast = useToast()

onMounted(() => {
    if (subscriptionSuccess) {
        toast.add({
            icon: 'i-lucide-check-circle',
            title: 'Abonnement activé! 🎉',
            description: 'Votre abonnement a été activé avec succès.',
            color: 'success',
            duration: 5000,
            actions: [{
                label: 'Gérer les abonnements',
                color: 'neutral',
                variant: 'outline',
                icon: 'i-lucide-settings',
                size: 'sm',
                onClick: () => {
                    navigateTo('/app/settings/establishments#subscriptions')
                }
            }]
        })
    }
})

const open = ref(false)

const { pending } = useEstablishments()

const links = ref<NavigationMenuItem[]>([
    {
        label: 'Factures',
        icon: 'i-lucide-files',
        to: '/app',
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
        label: 'Paramètres',
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
            label: 'Établissements',
            to: '/app/settings/establishments',
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
            label: 'Securité',
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
        title: 'Nous utilisons des cookies 🍪',
        duration: 0,
        close: false,
        actions: [{
            label: 'Accepter',
            color: 'neutral',
            variant: 'outline',
            onClick: () => {
                cookie.value = 'accepted'
            }
        }, {
            label: 'Refuser',
            color: 'neutral',
            variant: 'ghost'
        }]
    })
})
</script>

<template>
    <UDashboardGroup unit="rem">
        <UDashboardSidebar id="default" v-model:open="open" collapsible resizable class="bg-elevated/25"
            :ui="{ footer: 'lg:border-t lg:border-default', header: 'flex flex-col gap-4 justify-center items-center' }">
            <template #header="{ collapsed }">
                <div class="w-full gap-4 flex md:flex-col justify-between">
                    <div class="w-full flex justify-center items-center">
                        <CommonInvocloudBrand :collapsed="collapsed" />
                    </div>
                    <EstablishmentsMenuSelector :collapsed="collapsed" />
                </div>
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
            <LazyInvoicesUploadModalContainer size="md" variant="ghost" />
            <slot />
        </template>

        <!-- <NotificationsSlideover /> -->
    </UDashboardGroup>
</template>
