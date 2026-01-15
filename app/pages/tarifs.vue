<script lang="ts" setup>
import { UPricingPlans } from '#components';

const config = useRuntimeConfig();
const { data: page } = useAsyncData(() => queryCollection('tarifs').first())
const { data: plansData } = useAsyncData(() => queryCollection('plans').all(), {
    lazy: true,
})
const { isAuthenticated } = useAuth();

useSeoMeta({
    title: page.value?.seo.title || page.value?.title,
    titleTemplate:
        page.value?.seo.title || page.value?.title,
    description:
        page.value?.seo.description || page.value?.description,
    ogType: 'website',
    ogLocale: 'fr_FR',
    ogSiteName: 'Invocloud',
    ogTitle: page.value?.seo.title || page.value?.title,
    ogDescription:
        page.value?.seo.description || page.value?.description,
    ogUrl: config.public.baseUrl ?? 'https://invocloud.fr',
    ogImage: `${config.public.baseUrl}/thumbnail_1200.png`,
    ogImageAlt: 'Invocloud - Gérer vos factures en toute simplicité',
    ogImageHeight: 577,
    ogImageWidth: 1200,
    twitterCard: 'summary_large_image',
    twitterImage: `${config.public.baseUrl}/thumbnail_1200.png`,
    twitterImageAlt: 'Invocloud - Gérer vos factures en toute simplicité',
})

const plans = computed(() => plansData.value?.map((plan) => {
    const establishmentLabel = plan.establisments === null ? '∞ Établissements' : `${plan.establisments} Établissement${plan.establisments > 1 ? 's' : ''}`;
    const usersLabel = plan.users === null ? '∞ Utilisateurs' : `${plan.users} Utilisateur${plan.users > 1 ? 's' : ''}`;
    const invoicesLabel = plan['monthly-invoices'] === null ? '∞ Factures' : `${plan['monthly-invoices']} factures / mois`;
    const tarifPlan = page.value?.plans.find((p: any) => p.id === plan.name);
    return {
        id: plan.name,
        title: plan.title,
        description: plan.description,
        price: plan.price,
        highlight: tarifPlan?.highlight || false,
        scale: tarifPlan?.scale || false,
        features: [
            establishmentLabel,
            usersLabel,
            invoicesLabel,
            "Interfaçage PDP",
            ...(plan.features || []),
        ],
        button: {
            label: 'Choisir',
            onClick: () => onPricingClick(plan.name)
        },
    }
}) || []);

const onPricingClick = (planId: string) => {
    if (isAuthenticated.value) {
        navigateTo('/app/settings/establishments#subscriptions')
    } else {
        navigateTo('/auth/sign-up?plan=' + planId)
    }
};

const sections = computed(() => {
    return [
        {
            title: "Établissements et utilisateurs",
            features: [
                {
                    title: "Nombre d'établissements",
                    tiers: Object.fromEntries(
                        plansData.value?.map(plan => [plan.name, (plan.establisments == null ? 'Illimité' : plan.establisments)]) || []
                    )
                },
                {
                    title: "Nombre d'utilisateurs",
                    tiers: Object.fromEntries(
                        plansData.value?.map(plan => [plan.name, (plan.users == null ? 'Illimité' : plan.users)]) || []
                    )
                },
                {
                    title: "Factures mensuelles incluses",
                    tiers: Object.fromEntries(
                        plansData.value?.map(plan => [plan.name, (plan['monthly-invoices'] == null ? 'Illimité' : plan['monthly-invoices'])]) || []
                    )
                },
                {
                    title: "Prix par facture supplémentaire",
                    tiers: Object.fromEntries(
                        plansData.value?.map(plan => [plan.name, `${plan['price-per-extra-invoice'].toFixed(2).replace('.', ',')} €`]) || []
                    )
                }
            ]
        },
        {
            title: "Fonctionnalités",
            features: [
                {
                    title: "Envoi et téléchargement de factures",
                    tiers: Object.fromEntries(
                        plansData.value?.map(plan => [plan.name, true]) || []
                    )
                },
                {
                    title: "Réception de factures via l'application",
                    tiers: Object.fromEntries(
                        plansData.value?.map(plan => [plan.name, plan['transfert-invoice'] || false]) || []
                    )
                },
                {
                    title: "Reception de facture via email domaine personnalisé",
                    tiers: Object.fromEntries(
                        plansData.value?.map(plan => [plan.name, plan['email-invoice'] || false]) || []
                    )
                },
                {
                    title: "Interfaçage PDP",
                    tiers: Object.fromEntries(
                        plansData.value?.map(plan => [plan.name, plan.pdp]) || []
                    )
                },
                {
                    title: "Reconnaissance Optique de Caractères (OCR)",
                    tiers: Object.fromEntries(
                        plansData.value?.map(plan => [plan.name, plan.ocr]) || []
                    )
                }
            ]
        },
        {
            title: "Avantages",
            features: [
                {
                    title: "Support par email 24/7",
                    tiers: Object.fromEntries(
                        plansData.value?.map(plan => [plan.name, true]) || []
                    )
                },
                {
                    title: "Support Prioritaire",
                    tiers: Object.fromEntries(
                        plansData.value?.map(plan => [plan.name, plan.support || false]) || []
                    )
                },
                {
                    title: "Fonctionnalités à venir",
                    tiers: Object.fromEntries(
                        plansData.value?.map(plan => [plan.name, plan.beta || false]) || []
                    )
                }
            ]
        }
    ]
});
</script>

<template>
    <div v-if="page != null && plansData != null">
        <!-- Hero Section -->
        <UPageHero :ui="{
            root: 'py-8 md:py-6',
            container: 'text-center max-w-4xl mx-auto',
        }">
            <template #title>
                <div class="flex flex-col items-center gap-3 mb-4">
                    <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                        {{ page.title }}
                    </h1>
                </div>
            </template>
            <template #description>
                <p class="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto mb-6">
                    {{ page.description }}
                </p>
            </template>
            <template #links>
                <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <UButton size="xl" variant="solid" color="primary" :to="{ path: '/auth/sign-up' }"
                        class="shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all">
                        <template #leading>
                            <UIcon name="i-lucide-rocket" class="size-5" />
                        </template>
                        <div class="text-left">
                            <span class="font-bold text-lg block">
                                Commencer gratuitement
                            </span>
                            <span class="text-xs text-primary-100 block">
                                Pas de carte de crédit requise
                            </span>
                        </div>
                    </UButton>
                    <UButton size="xl" variant="outline" color="gray" to="/#features">
                        <template #leading>
                            <UIcon name="i-lucide-info" class="size-5" />
                        </template>
                        Voir les fonctionnalités
                    </UButton>
                </div>
            </template>
        </UPageHero>

        <!-- Comparison Cards Section -->
        <UPageSection :ui="{
            root: 'bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 py-16',
            container: 'max-w-7xl',
        }">
            <div class="mb-12 text-center">
                <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Comparez nos formules
                </h2>
                <p class="text-gray-600 dark:text-gray-400">
                    Trouvez l'offre qui correspond à vos besoins
                </p>
            </div>

            <UPricingTable :tiers="plans" :sections="sections" :ui="{
                root: 'bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden',
                thead: 'bg-gray-50 dark:bg-gray-800/50',
                tier: 'p-6',
                tierTitle: 'text-xl font-bold text-gray-900 dark:text-white',
                tierDescription: 'text-sm text-gray-600 dark:text-gray-400 h-12 mt-2',
                tierPrice: 'text-3xl font-extrabold text-gray-900 dark:text-white mt-4',
                tierButton: 'mt-6',
                section: 'border-t border-gray-200 dark:border-gray-800',
                sectionTitle: 'bg-gray-50 dark:bg-gray-800/30 px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide',
                feature: 'px-6 py-4 border-t border-gray-100 dark:border-gray-800',
                featureTitle: 'text-sm font-medium text-gray-900 dark:text-white pl-4',
                featureValue: 'text-center',
            }">
                <template #pro-title="{ tier }">
                    <div class="flex items-center gap-2">
                        <UIcon name="i-lucide-crown" class="size-5 text-amber-500" />
                        {{ tier.title }}
                    </div>
                </template>
                <template #tier-price="{ tier }">
                    <div class="flex items-baseline justify-center gap-2">
                        <span class="text-4xl font-extrabold">{{ tier.price }}</span>
                        <span class="text-lg text-gray-500 dark:text-gray-400">/mois</span>
                    </div>
                </template>
                <template #tier-button="{ tier }">
                    <UButton :label="tier.highlight ? 'Commencer maintenant' : 'Choisir ce plan'"
                        :color="tier.highlight ? 'primary' : 'gray'" :variant="tier.highlight ? 'solid' : 'outline'"
                        size="lg" block @click="onPricingClick(tier.id)" class="font-semibold" />
                </template>
            </UPricingTable>
        </UPageSection>

        <!-- FAQ / Trust Section -->
        <UPageSection :ui="{
            root: 'bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 py-16',
            container: 'max-w-5xl',
        }">
            <div class="text-center mb-12">
                <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Questions fréquentes
                </h2>
            </div>

            <div class="grid md:grid-cols-2 gap-6">
                <UCard :ui="{
                    root: 'bg-white dark:bg-gray-900 hover:shadow-lg transition-shadow',
                    body: 'space-y-3',
                }">
                    <div class="flex items-start gap-3">
                        <div class="flex-shrink-0">
                            <div
                                class="flex items-center justify-center size-10 rounded-full bg-primary-100 dark:bg-primary-900">
                                <UIcon name="i-lucide-help-circle" class="size-5 text-primary-600" />
                            </div>
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
                                Puis-je changer de plan ?
                            </h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400">
                                Oui, vous pouvez changer de plan à tout moment depuis votre tableau de bord.
                            </p>
                        </div>
                    </div>
                </UCard>

                <UCard :ui="{
                    root: 'bg-white dark:bg-gray-900 hover:shadow-lg transition-shadow',
                    body: 'space-y-3',
                }">
                    <div class="flex items-start gap-3">
                        <div class="flex-shrink-0">
                            <div
                                class="flex items-center justify-center size-10 rounded-full bg-primary-100 dark:bg-primary-900">
                                <UIcon name="i-lucide-credit-card" class="size-5 text-primary-600" />
                            </div>
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
                                Quels moyens de paiement ?
                            </h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400">
                                Nous acceptons toutes les cartes bancaires via notre système de paiement sécurisé.
                            </p>
                        </div>
                    </div>
                </UCard>

                <UCard :ui="{
                    root: 'bg-white dark:bg-gray-900 hover:shadow-lg transition-shadow',
                    body: 'space-y-3',
                }">
                    <div class="flex items-start gap-3">
                        <div class="flex-shrink-0">
                            <div
                                class="flex items-center justify-center size-10 rounded-full bg-primary-100 dark:bg-primary-900">
                                <UIcon name="i-lucide-shield-check" class="size-5 text-primary-600" />
                            </div>
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
                                Mes données sont-elles sécurisées ?
                            </h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400">
                                Absolument. Vos données sont cryptées et hébergées en France selon les normes RGPD.
                            </p>
                        </div>
                    </div>
                </UCard>

                <UCard :ui="{
                    root: 'bg-white dark:bg-gray-900 hover:shadow-lg transition-shadow',
                    body: 'space-y-3',
                }">
                    <div class="flex items-start gap-3">
                        <div class="flex-shrink-0">
                            <div
                                class="flex items-center justify-center size-10 rounded-full bg-primary-100 dark:bg-primary-900">
                                <UIcon name="i-lucide-headphones" class="size-5 text-primary-600" />
                            </div>
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
                                Comment contacter le support ?
                            </h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400">
                                Notre équipe est disponible 24/7 par email à contact@invocloud.com
                            </p>
                        </div>
                    </div>
                </UCard>
            </div>

            <!-- CTA Final -->
            <div class="mt-16 text-center">
                <UCard :ui="{
                    root: 'bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-950/30 dark:to-blue-950/30 border-primary-200 dark:border-primary-800',
                    body: 'py-12 px-6',
                }">
                    <div class="flex flex-col items-center gap-6">
                        <div
                            class="flex items-center justify-center size-16 rounded-full bg-gradient-to-br from-primary-500 to-blue-500 shadow-lg">
                            <UIcon name="i-lucide-zap" class="size-8 text-white" />
                        </div>
                        <div class="text-center space-y-3">
                            <h3 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                                Prêt à digitaliser votre facturation ?
                            </h3>
                            <p class="text-gray-600 dark:text-gray-400 max-w-2xl">
                                Rejoignez les centaines d'entreprises qui font confiance à Invocloud
                            </p>
                        </div>
                        <UButton size="xl" color="primary" to="/auth/sign-up" class="shadow-lg">
                            <template #leading>
                                <UIcon name="i-lucide-rocket" />
                            </template>
                            Démarrer gratuitement
                        </UButton>
                    </div>
                </UCard>
            </div>
        </UPageSection>
    </div>
</template>