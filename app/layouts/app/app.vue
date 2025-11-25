<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { LazyInvoicesUploadModalContainer } from '#components'


const route = useRoute()

// get the subscription_success from the query params
const subscriptionSuccess = route.query.subscription_success === 'true'
const toast = useToast()
const open = ref(false)

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
                    navigateTo('/app/settings/billing')
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
            label: 'Profile',
            to: '/app/settings',
            exact: true,
            onSelect: () => {
                open.value = false
            }
        }, {
            label: 'Paiements',
            to: '/app/settings/establishments',
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
                <UsersUserMenu :collapsed="collapsed" />
            </template>
        </UDashboardSidebar>
        <LazyInvoicesUploadModalContainer size="md" variant="ghost" />
        <slot />
    </UDashboardGroup>
</template>
