<script setup lang="ts">
    import { z } from 'zod';
    import type { FormSubmitEvent } from '@nuxt/ui'

    const { openModal } = useInvoiceUpload()
    const config = useRuntimeConfig();

    const schema = z.object({
        email: z.string().email('Veuillez entrer un email valide'),
    });
    const state = reactive({
        email: ''
    });

    type Schema = z.output<typeof schema>

    const onSubmit = async (event: FormSubmitEvent<Schema>) => {
        // Handle form submission logic here
    };


    const { data: page } = await useAsyncData(() => queryCollection('index').first())
    const user = useSupabaseUser()

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
                <UButton v-if="user != null && user.is_anonymous === false" to="/app" class="z-50"
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
            root: 'bg-muted text-muted pt-[var(--ui-header-height)] md:pt-8',
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
            root: 'text-muted pt-[var(--ui-header-height)] md:pt-8',
            title: 'max-w-xl mx-auto text-muted',
        }">
            <UContainer>
                <UPricingPlans scale>
                    <UPricingPlan v-for="(plan, index) in page.pricing.plans" :key="index" v-bind="plan"
                        variant="subtle" :ui="{
                            root: 'bg-primary-100/15 text-muted',
                            title: 'text-muted',
                            description: 'text-muted',
                            price: 'text-muted',
                            footer: 'items-start',
                            button: 'w-auto',
                            featureTitle: 'text-xs md:text-sm'
                        }">
                    </UPricingPlan>
                </UPricingPlans>
            </UContainer>
        </UPageSection>

        <UPageSection id="trust" title="Ils nous font confiance" :ui="{
            root: 'bg-muted text-muted pt-[var(--ui-header-height)] md:pt-8',
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
