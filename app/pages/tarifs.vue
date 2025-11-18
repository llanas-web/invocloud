<script lang="ts" setup>
import { UPricingPlans } from '#components';

const config = useRuntimeConfig();
const { data: page } = useAsyncData(() => queryCollection('tarifs').first())
const { data: plansData } = useAsyncData(() => queryCollection('plans').all(), {
    lazy: true,
})
console.log(plansData.value);

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
        button: tarifPlan?.button || {
            label: 'Choisir',
            to: '/auth/sign-up'
        },
    }
}) || []);

const sections = computed(() => {
    console.log(plansData.value);
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
console.log(sections.value);

</script>

<template>
    <div v-if="page != null && plansData != null">
        <UPageHero :ui="{ title: 'text-muted' }">
            <template #title>
                {{ page.title }}
            </template>
            <template #description>
                <p class="text-muted text-lg">{{ page.description }}</p>
            </template>
            <template #links>
                <UButton size="xl" variant="solid" color="primary" :to="{ path: '/auth/sign-up' }" :ui="{
                    base: 'px-8'
                }">
                    <div>
                        <span class="font-title text-2xl">
                            Start for free
                        </span>
                        <span class="mt-2 block text-sm text-muted">
                            Pas de carte de crédit requise
                        </span>
                    </div>
                </UButton>
            </template>
        </UPageHero>

        <UPageSection>
            <UPricingPlans>
                <UPricingPlan v-for="plan in plans" :key="plan.id" v-bind="plan" :ui="{
                    root: 'bg-card border-border',
                    title: 'text-lg font-semibold text-muted',
                    price: 'text-3xl font-extrabold text-muted',
                    description: 'text-sm text-muted h-12',
                    feature: 'text-muted',
                    button: 'w-full',
                    tagline: 'font-medium text-xs text-muted mt-2',
                }">
                    <template #title>
                        <div class="flex items-center gap-2">
                            <UIcon v-if="plan.highlight" name="i-lucide-crown" class="text-amber-500" />
                            {{ plan.title }}
                        </div>
                    </template>
                </UPricingPlan>
            </UPricingPlans>
        </UPageSection>

        <UPageSection>
            <UPricingTable :tiers="plans" :sections="sections" :ui="{
                tierDescription: 'text-sm text-muted h-12',
            }">
                <template #pro-title="{ tier }">
                    <div class="flex items-center gap-2">
                        <UIcon name="i-lucide-crown" class=" text-amber-500" />
                        {{ tier.title }}
                    </div>
                </template>
            </UPricingTable>
        </UPageSection>
    </div>
</template>