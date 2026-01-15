<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui'

const { openModal } = useUploadWizard()
const { isAuthenticated, connectedUser, actions: { createCheckoutSession } } = useAuth();
const { pending, isCanceled, subscription, actions: {
    activateSubscription,
    cancelSubscription,
} } = useUser()
const { subscriptionPlans, pending: plansPending, error: plansError } = useSubscriptionPlan();

const config = useRuntimeConfig();

const schema = z.object({
    email: z.email('Veuillez entrer un email valide'),
});
const state = reactive({
    email: ''
});

type Schema = z.output<typeof schema>

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
    // Handle form submission logic here
};


const { data: page } = await useAsyncData(() => queryCollection('index').first())

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



const { data: tarifsPage } = useAsyncData(() => queryCollection('tarifs').first())
const { data: plansData } = useAsyncData(() => queryCollection('plans').all(), {
    lazy: true,
})

const plans = computed(() => plansData.value?.map((plan) => {
    const establishmentLabel = plan.establisments === null ? '∞ Établissements' : `${plan.establisments} Établissement${plan.establisments > 1 ? 's' : ''}`;
    const usersLabel = plan.users === null ? '∞ Utilisateurs' : `${plan.users} Utilisateur${plan.users > 1 ? 's' : ''}`;
    const invoicesLabel = plan['monthly-invoices'] === null ? '∞ Factures' : `${plan['monthly-invoices']} factures / mois`;
    const tarifPlan = tarifsPage.value?.plans.find((p: any) => p.id === plan.name);
    const customFeatures = [];
    if (plan.ocr) customFeatures.push('OCR de factures');
    if (plan['email-invoice']) customFeatures.push('Adresse email customisée');

    return {
        id: plan.plan_id,
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
            ...customFeatures,
            ...(plan.features || []),
        ],
    }
}) || []);

const loading = computed(() => pending.value || plansPending.value || createCheckoutSession.pending.value || activateSubscription.pending.value || cancelSubscription.pending.value);

const onChangePlan = async (planId: string) => {
    await activateSubscription.execute({ subscriptionPlanId: planId });
};

const onCancel = async () => {
    await cancelSubscription.execute();
};

const onReactivate = async () => {
    await activateSubscription.execute({ subscriptionPlanId: subscription.value!.planId });
};

const onPlanSelect = async (planId: string) => {
    await createCheckoutSession.execute(planId);
};
</script>


<template>
    <div v-if="page != null">
        <UPageHero orientation="horizontal" :ui="{ title: 'text-muted' }">
            <template #title>
                {{ page.title.split(' ')[0] }}
                <br />
                et gérez vos <span class="text-primary">factures</span>
                <br />
                en toute simplicité.
            </template>
            <template #description>
                <p class="text-muted text-lg">{{ page.description }}</p>
            </template>
            <template #links>
                <UButton v-if="isAuthenticated && !connectedUser?.isAnonymous" to="/app" class="z-50"
                    trailingIcon="i-lucide-home" size="xl">Tableau de bord</UButton>
                <UButton v-else to="/auth/login" class="z-50" trailingIcon="i-lucide-log-in" size="xl">
                    Connexion
                </UButton>
                <UButton label="Envoyer des factures" trailing-icon="i-lucide-send" size="xl" variant="subtle"
                    class="z-50" @click="openModal" :ui="{
                        label: 'hidden md:block',
                    }" />
            </template>
            <CommonInvocloudLogo @click="openModal" />
        </UPageHero>

        <UPageSection id="features" :title="page?.sections[0]!.title" :description="page?.sections[0]!.description" :ui="{
            root: 'bg-muted text-muted pt-(--ui-header-height) md:pt-8',
            title: 'max-w-xl mx-auto text-muted',
            description: 'max-w-xl mx-auto text-muted',
        }">
            <UPageGrid>
                <UPageCard v-for="(item, index) in page?.sections[0]!.features" :key="index" v-bind="item" spotlight
                    variant="outline" :ui="{
                        root: 'rounded-2xl',
                        container: 'sm:px-12 sm:py-8',
                        title: 'sm:text-xl',
                        description: 'sm:text-lg',
                        leadingIcon: 'sm:size-8'
                    }" />
            </UPageGrid>
        </UPageSection>


        <UPageSection id="pricing" :title="page.pricing.title" :description="page.pricing.description" :ui="{
            root: 'text-muted pt-(--ui-header-height) md:pt-8',
            title: 'max-w-xl mx-auto text-muted',
        }">
            <UContainer>
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
                        <template #button>
                            <UButton v-if="subscription === null" label="Choisir ce plan" color="primary"
                                @click="onPlanSelect(plan.id)" :loading="loading" :disabled="loading" />

                            <UButton v-else-if="plan.id === subscription!.planId"
                                :label="isCanceled ? 'Réactiver' : 'Abonnement en cours'"
                                :color="isCanceled ? 'success' : 'success'"
                                @click="isCanceled ? onReactivate() : onCancel()" :loading="loading"
                                :disabled="loading" />

                            <UButton v-else label="Changer de plan" color="primary" @click="onChangePlan(plan.id)"
                                :loading="loading" :disabled="loading" />
                        </template>
                    </UPricingPlan>
                </UPricingPlans>
            </UContainer>
        </UPageSection>

        <UPageSection id="regulation-2026" :ui="{
            root: 'bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-950/30 dark:to-blue-950/30 py-12 md:py-16',
            container: 'max-w-none px-0',
        }">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
                    <!-- Image Section -->
                    <div class="order-2 lg:order-1 lg:col-span-2">
                        <div class="relative">
                            <!-- Background decoration -->
                            <div
                                class="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-blue-500/20 rounded-3xl blur-3xl">
                            </div>

                            <!-- Main illustration container -->
                            <div
                                class="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-2xl border border-primary-200 dark:border-primary-800">
                                <div class="aspect-square flex items-center justify-center">
                                    <!-- Decorative elements -->
                                    <div class="relative w-full h-full">
                                        <!-- Central icon -->
                                        <div class="absolute inset-0 flex items-center justify-center">
                                            <div class="relative">
                                                <div
                                                    class="absolute inset-0 bg-primary-500/20 rounded-full blur-2xl animate-pulse">
                                                </div>
                                                <div
                                                    class="relative flex items-center justify-center size-32 md:size-40 lg:size-48 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 shadow-xl">
                                                    <UIcon name="i-lucide-shield-check"
                                                        class="size-16 md:size-20 lg:size-24 text-white" />
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Floating documents -->
                                        <div class="absolute top-8 left-8 animate-bounce"
                                            style="animation-duration: 3s;">
                                            <div
                                                class="flex items-center justify-center size-16 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
                                                <UIcon name="i-lucide-file-text" class="size-8 text-primary-600" />
                                            </div>
                                        </div>

                                        <div class="absolute bottom-8 right-8 animate-bounce"
                                            style="animation-duration: 4s; animation-delay: 1s;">
                                            <div
                                                class="flex items-center justify-center size-16 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
                                                <UIcon name="i-lucide-file-check-2" class="size-8 text-green-600" />
                                            </div>
                                        </div>

                                        <div class="absolute top-1/2 right-4 -translate-y-1/2 animate-bounce"
                                            style="animation-duration: 3.5s; animation-delay: 0.5s;">
                                            <div
                                                class="flex items-center justify-center size-14 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
                                                <UIcon name="i-lucide-calendar-check" class="size-7 text-blue-600" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Content Section -->
                    <div class="order-1 lg:order-2 lg:col-span-3 space-y-6">
                        <div>
                            <UBadge size="lg" color="primary" variant="subtle" class="mb-4">
                                <UIcon name="i-lucide-sparkles" class="mr-2" />
                                Nouveauté 2026
                            </UBadge>
                            <h2 class="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                                Conforme à la
                                <span
                                    class="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-600">
                                    réglementation 2026
                                </span>
                            </h2>
                            <p class="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                                Nous travaillons activement à l'intégration du système de gestion des factures conforme
                                à la nouvelle réglementation de dématérialisation des factures qui entrera en vigueur en
                                <span class="font-bold text-primary-600 dark:text-primary-400">septembre 2026</span>.
                            </p>
                        </div>

                        <div
                            class="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                            <p class="text-base md:text-lg text-gray-700 dark:text-gray-300">
                                Votre plateforme sera <span
                                    class="font-semibold text-primary-600 dark:text-primary-400">automatiquement mise à
                                    jour</span>
                                pour assurer une conformité totale, sans aucune action de votre part.
                            </p>
                        </div>

                        <div class="grid gap-4 pt-4">
                            <div
                                class="flex items-start gap-4 p-4 rounded-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                                <div class="flex-shrink-0">
                                    <div
                                        class="flex items-center justify-center size-12 rounded-full bg-primary-100 dark:bg-primary-900">
                                        <UIcon name="i-lucide-zap" class="size-6 text-primary-600" />
                                    </div>
                                </div>
                                <div>
                                    <h3 class="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                                        Transition automatique
                                    </h3>
                                    <p class="text-gray-600 dark:text-gray-400">
                                        Mise à jour transparente de votre système sans interruption
                                    </p>
                                </div>
                            </div>

                            <div
                                class="flex items-start gap-4 p-4 rounded-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                                <div class="flex-shrink-0">
                                    <div
                                        class="flex items-center justify-center size-12 rounded-full bg-green-100 dark:bg-green-900">
                                        <UIcon name="i-lucide-check-circle-2" class="size-6 text-green-600" />
                                    </div>
                                </div>
                                <div>
                                    <h3 class="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                                        100% conforme
                                    </h3>
                                    <p class="text-gray-600 dark:text-gray-400">
                                        Respect total de la réglementation française
                                    </p>
                                </div>
                            </div>

                            <div
                                class="flex items-start gap-4 p-4 rounded-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                                <div class="flex-shrink-0">
                                    <div
                                        class="flex items-center justify-center size-12 rounded-full bg-blue-100 dark:bg-blue-900">
                                        <UIcon name="i-lucide-shield" class="size-6 text-blue-600" />
                                    </div>
                                </div>
                                <div>
                                    <h3 class="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                                        Continuité de service
                                    </h3>
                                    <p class="text-gray-600 dark:text-gray-400">
                                        Aucune interruption de votre activité garantie
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </UPageSection>

        <UPageSection id="trust" title="Ils nous font confiance" :ui="{
            root: 'bg-muted text-muted pt-(--ui-header-height) md:pt-8',
            title: 'max-w-xl mx-auto text-muted',
        }">
            <template #description>
                <p class="mt-8 text-lg">
                    <UIcon name="i-lucide-trending-up" class="inline align-[-2px] text-primary mr-2" />
                    Rejoignez les professionnels qui ont digitalisé leur facturation avec
                    <span class="text-primary font-medium">Invocloud</span>.
                </p>
            </template>
            <template #body>

                <UContainer class="text-center">
                    <div class="flex flex-wrap items-center justify-center gap-3 mt-4">
                        <span class="inline-flex items-center gap-2 rounded-full bg-primary-100/15 px-4 py-2 text-xl">
                            <UIcon name="i-lucide-shopping-cart" class="text-primary" />
                            Supérettes
                        </span>
                        <span class="inline-flex items-center gap-2 rounded-full bg-primary-100/15 px-4 py-2 text-xl">
                            <UIcon name="i-lucide-briefcase" class="text-primary" />
                            Cabinets comptables
                        </span>
                        <span class="inline-flex items-center gap-2 rounded-full bg-primary-100/15 px-4 py-2 text-xl">
                            <UIcon name="i-lucide-user" class="text-primary" />
                            Indépendants
                        </span>
                        <span class="inline-flex items-center gap-2 rounded-full bg-primary-100/15 px-4 py-2 text-xl">
                            <UIcon name="i-lucide-building" class="text-primary" />
                            TPE
                        </span>
                    </div>
                </UContainer>
            </template>
            <template #footer>
                <p class="text-center">Pour toute question, contactez-nous à l'adresse suivante : <a
                        href="mailto:contact@invocloud.com" class="text-primary font-medium">contact@invocloud.com</a>
                </p>
            </template>
        </UPageSection>

        <UPageSection>
            <template #title>
                <ul class="font-normal uppercase space-y-2">
                    <li class="hover:underline">
                        <NuxtLink to="/faq">FAQ</NuxtLink>
                    </li>
                    <li class="hover:underline">
                        <NuxtLink to="/pdc">Politique de confidentialité</NuxtLink>
                    </li>
                    <li class="hover:underline">
                        <NuxtLink to="/cgu">Condition Générale d'Utilisation</NuxtLink>
                    </li>
                </ul>
            </template>
            <template #description>
                <p>Inscrivez-vous à notre newsletter pour découvrir toutes nos nouvelles fonctionnalités en
                    temps réel!</p>
            </template>
            <div class="max-w-md mx-auto">
                <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
                    <UInput label="Email" type="email" placeholder="Entrez votre email" class="mr-4" />
                    <UButton type="submit">S'inscrire</UButton>
                </UForm>
                <ul class="flex flex-row justify-center items-center gap-6 mt-12 text-primary">
                    <li>
                        <UButton icon="i-simple-icons-linkedin" variant="ghost" color="primary" size="lg" />
                    </li>
                    <li>
                        <UButton icon="i-simple-icons-facebook" variant="ghost" color="primary" size="lg" />
                    </li>
                    <li>
                        <UButton icon="i-simple-icons-instagram" variant="ghost" color="primary" size="lg" />
                    </li>
                </ul>
            </div>
        </UPageSection>
    </div>
</template>
