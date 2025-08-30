<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { LazyInvoicesUploadModalContainer } from '#components'

const route = useRoute()
const router = useRouter()

// get the subscription_success from the query params
const subscriptionSuccess = route.query.subscription_success === 'true'
const toast = useToast()
const open = ref(false)

const { pending, selectedEstablishment, subscribeToStripe } = useEstablishments()
const user = useSupabaseUser()

const isEstablishementActive = computed(() => {
    if (router.currentRoute.value.name?.toString().includes('app-settings')) {
        return true;
    }
    return selectedEstablishment.value?.subscription_status === 'active' || selectedEstablishment.value?.subscription_status === 'trialing'
})

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

// A décommenter lorsqu'on mettra en place les cookies
// onMounted(async () => {
//     const cookie = useCookie('cookie-consent')
//     if (cookie.value === 'accepted') {
//         return
//     }

//     toast.add({
//         title: 'Nous utilisons des cookies 🍪',
//         duration: 0,
//         close: false,
//         actions: [{
//             label: 'Accepter',
//             color: 'neutral',
//             variant: 'outline',
//             onClick: () => {
//                 cookie.value = 'accepted'
//             }
//         }, {
//             label: 'Refuser',
//             color: 'neutral',
//             variant: 'ghost'
//         }]
//     })
// })

const onSubscribe = async () => {
    if (!selectedEstablishment.value) {
        toast.add({
            title: 'Aucun établissement sélectionné',
            description: 'Veuillez sélectionner un établissement avant de vous abonner.',
            color: 'warning',
        })
        return
    }
    await subscribeToStripe()
}

</script>

<template>
    <UDashboardGroup unit="rem">
        <UDashboardSidebar id="default" v-model:open="open" collapsible resizable class="bg-elevated/25"
            :ui="{ footer: 'lg:border-t lg:border-default', header: 'flex flex-col gap-4 justify-center items-center' }">
            <template #header="{ collapsed }">
                <div class="w-full gap-4 flex lg:flex-col justify-between">
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
            <template v-if="isEstablishementActive">
                <LazyInvoicesUploadModalContainer size="md" variant="ghost" />
                <slot />
            </template>
            <template v-else>
                <UDashboardPanel id="invoices">
                    <template #header>
                        <UDashboardNavbar title="Aucun abonnement actif" :ui="{ title: 'text-muted' }">
                            <template #leading>
                                <UDashboardSidebarCollapse />
                            </template>
                        </UDashboardNavbar>
                    </template>

                    <template #body>
                        <div class="max-w-lg flex flex-col items-center justify-center gap-4 p-4 mx-auto">
                            <div>
                                <h2 class="text-left text-4xl font-bold text-muted">
                                    Bonjour <span class="text-primary">
                                        {{ user?.user_metadata?.full_name || user?.email }}</span>
                                </h2>
                                <div class="mt-1 text-left text-muted mb-4 font-sans">
                                    Terminez votre inscription à <span class="text-primary">
                                        Invocloud
                                    </span>
                                </div>
                            </div>
                            <UCard variant="soft" class="w-full bg-primary-50 lg:rounded-3xl lg:px-16 lg:py-6">
                                <div class="flex flex-col gap-2 text-muted font-sans font-medium">
                                    Profitez de l'abonnement Invocloud avec
                                    <span class="text-primary font-bold text-2xl lg:text-4xl">7 jours gratuits</span>
                                    <span class="text-primary">Puis 29,99€ / mois</span>
                                </div>
                            </UCard>
                            <USeparator />
                            <UButton class="w-full justify-center py-3 cursor-pointer"
                                label="Démarrer la période d'essai" @click="onSubscribe" />
                            <span class="text-center text-sm text-muted">Si vous n’annulez pas votre essai avant les 7
                                jours, un
                                montant de
                                29,90€ vous
                                sera
                                facturé par
                                mois à
                                compter du {{ new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
                                }}</span>
                        </div>
                    </template>
                </UDashboardPanel>
            </template>
        </template>
        <UProgress class="w-full" v-else :ui="{ base: 'rounded-none', indicator: 'rounded-none' }" />

        <!-- <NotificationsSlideover /> -->
    </UDashboardGroup>
</template>
