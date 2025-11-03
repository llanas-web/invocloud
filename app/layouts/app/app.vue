<script setup lang="ts">
    import type { NavigationMenuItem } from '@nuxt/ui'
    import { LazyInvoicesUploadModalContainer } from '#components'
    import type { AuthUserModel } from '~~/shared/application/common/providers/auth/dto/auth.dto';


    const route = useRoute()
    const router = useRouter()
    const { connectedUser } = useAuth();
    const { formState, pending, onSubmit: createEstablishment } = useEstablishmentCreate()
    const { establishments, status } = useEstablishmentsList()
    const { isActive, isTrial, actions } = useEstablishmentDetails()

    // get the subscription_success from the query params
    const subscriptionSuccess = route.query.subscription_success === 'true'
    const toast = useToast()
    const open = ref(false)


    const isEstablishementActive = computed(() => {
        if (router.currentRoute.value.name?.toString().includes('app-settings')) {
            return true;
        }
        return isActive.value || isTrial.value;
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


    const links = ref<NavigationMenuItem[][]>([[
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
                label: 'Securité',
                to: '/app/settings/security',
                onSelect: () => {
                    open.value = false
                }
            }],
        },
    ], [
        {
            label: 'Website',
            icon: 'i-lucide-home',
            to: '/',
            target: '_blank'
        }, {
            label: 'CGU',
            icon: 'i-lucide-info',
            to: '/cgu',
            target: '_blank'
        },
        {
            label: 'Politique de confidentialité',
            icon: 'i-lucide-lock',
            to: '/pdc',
            target: '_blank'
        }]])

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
                <UNavigationMenu :collapsed="collapsed" :items="links[0]" orientation="vertical">
                </UNavigationMenu>


                <UNavigationMenu :collapsed="collapsed" :items="links[1]" orientation="vertical" tooltip
                    class="mt-auto" />
            </template>
            <template #footer="{ collapsed }">
                <UserMenu :collapsed="collapsed" />
            </template>
        </UDashboardSidebar>
        <UProgress class="w-full" v-if="!connectedUser || status === 'idle' || pending"
            :ui="{ base: 'rounded-none', indicator: 'rounded-none' }" />
        <template v-else-if="establishments.length > 0">
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
                                        {{ (connectedUser as AuthUserModel)?.email ?? "" }}</span>
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
                                label="Démarrer la période d'essai" @click="actions.createCheckoutSession.execute" />
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
        <template v-else>
            <UDashboardPanel id="invoices">
                <template #header>
                    <UDashboardNavbar title="Aucun établissement" :ui="{ title: 'text-muted' }" />
                </template>

                <template #body>
                    <div class="max-w-lg flex flex-col items-center justify-center gap-4 p-4 mx-auto">
                        <div>
                            <h2 class="text-left text-4xl font-bold text-muted">
                                Bonjour <span class="text-primary">
                                    {{ (connectedUser as AuthUserModel).email }}</span>
                            </h2>
                            <div class="mt-1 text-left text-muted mb-4 font-sans">
                                Terminez votre inscription à <span class="text-primary">
                                    Invocloud
                                </span>
                            </div>
                        </div>
                        <UForm :schema="CreateEstablishmentSchema" :state="formState" class="w-full space-y-4"
                            @submit="createEstablishment">
                            <UFormField label="Nom de l'établissement" placeholder="Nom de l'établissement" name="name">
                                <UInput v-model="formState.name" class="w-full" />
                            </UFormField>
                            <div class="flex justify-end gap-2">
                                <UButton label="Annuler" color="neutral" variant="subtle" @click="open = false" />
                                <UButton label="Créer" color="primary" variant="solid" type="submit" />
                            </div>
                        </UForm>
                    </div>
                </template>
            </UDashboardPanel>
        </template>
    </UDashboardGroup>
</template>
