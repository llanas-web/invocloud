<script setup lang="ts">
import { LazyInvoicesUploadModalContainer } from '#components';
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui'

const { openModal } = useInvoiceUpload()

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
definePageMeta({
    layout: false,
})
</script>


<template>
    <div class="absolute w-96 h-96 rounded-full bg-[#5E73F7] opacity-80 blur-3xl"
        style="top: -30%; left: 50%; transform: translateX(-50%);"></div>
    <UApp>
        <UHeader :toggle="false">
            <template #left>
                <NuxtLink to="/">
                    <div class="flex gap-4 h-8">
                        <UIcon name="i-custom-invocloud-logo" class="text-primary size-10" />
                        <UIcon name="i-custom-invocloud" class="text-primary h-10" />
                    </div>
                </NuxtLink>
            </template>
            <UButton label="Fonctionnalités" :to="{ path: '/', hash: '#features' }" size="md" variant="ghost"
                trailing-icon="i-lucide-star" :ui="{
                    label: 'hidden md:block'
                }" />
            <UButton label="Tarifs" :to="{ path: '/', hash: '#pricing' }" size="md" variant="ghost"
                trailing-icon="i-lucide-wallet" :ui="{
                    label: 'hidden md:block'
                }" />
            <template #right>
                <UButton label="Envoyer des factures" trailing-icon="i-lucide-send" size="md" variant="soft" :ui="{
                    label: 'hidden md:block',
                }" @click="openModal" />
                <UButton v-if="user != null && user.is_anonymous === false" label="Tableau de bord" to="/app"
                    trailingIcon="i-lucide-home" size="md" variant="solid" :ui="{
                        label: 'hidden md:block'
                    }" />
                <UButton v-else label="Connexion" variant="ghost" :ui="{
                    label: 'hidden md:block'
                }" to="/auth/login" trailingIcon="i-lucide-log-in" size="md" />
            </template>
        </UHeader>

        <UMain>
            <div v-if="page">
                <LazyInvoicesUploadModalContainer size="md" variant="ghost" />
                <UPageHero orientation="horizontal">
                    <template #title>
                        <h1 class="text-muted">
                            {{ page.title.split(' ')[0] }}
                            <br />
                            et gérez vos <span class="text-primary">factures</span>
                            <br />
                            en toute simplicité.
                        </h1>
                    </template>
                    <template #description>
                        <p class="text-muted text-lg">{{ page.description }}</p>
                    </template>
                    <template #links>
                        <UButton v-if="user != null && user.is_anonymous === false" to="/app"
                            trailingIcon="i-lucide-home" size="xl">Tableau de bord</UButton>
                        <UButton v-else to="/auth/login" trailingIcon="i-lucide-log-in" size="xl">
                            Connexion
                        </UButton>
                        <UButton label="Envoyer des factures" trailing-icon="i-lucide-send" size="xl" variant="subtle"
                            @click="openModal" :ui="{
                                label: 'hidden md:block',
                            }" />
                    </template>
                    <CommonInvocloudLogo @click="openModal" />
                </UPageHero>

                <UPageSection id="features" :title="page?.sections[0].title"
                    :description="page?.sections[0].description" :ui="{
                        root: 'bg-muted text-muted pt-[var(--ui-header-height)] md:pt-8',
                        title: 'max-w-xl mx-auto text-muted',
                        description: 'max-w-xl mx-auto text-muted',
                    }">
                    <UPageGrid>
                        <UPageCard v-for="(item, index) in page?.sections[0].features" :key="index" v-bind="item"
                            spotlight variant="outline" :ui="{
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
                                    button: 'w-auto'
                                }">
                            </UPricingPlan>
                        </UPricingPlans>
                    </UContainer>
                </UPageSection>

                <UPageSection id="trust" title="Ils nous font confiance" :ui="{
                    root: 'bg-muted text-muted pt-[var(--ui-header-height)] md:pt-8',
                    title: 'max-w-xl mx-auto text-muted',
                }">
                    <UContainer class="text-center">
                        <div class="flex flex-wrap items-center justify-center gap-3 mt-4">
                            <span
                                class="inline-flex items-center gap-2 rounded-full bg-primary-100/15 px-4 py-2 text-xl">
                                <UIcon name="i-lucide-check-circle-2" class="text-primary" />
                                Supérettes
                            </span>
                            <span
                                class="inline-flex items-center gap-2 rounded-full bg-primary-100/15 px-4 py-2 text-xl">
                                <UIcon name="i-lucide-check-circle-2" class="text-primary" />
                                Cabinets comptables
                            </span>
                            <span
                                class="inline-flex items-center gap-2 rounded-full bg-primary-100/15 px-4 py-2 text-xl">
                                <UIcon name="i-lucide-check-circle-2" class="text-primary" />
                                Indépendants
                            </span>
                            <span
                                class="inline-flex items-center gap-2 rounded-full bg-primary-100/15 px-4 py-2 text-xl">
                                <UIcon name="i-lucide-check-circle-2" class="text-primary" />
                                TPE
                            </span>
                        </div>

                        <p class="mt-8 text-lg">
                            <UIcon name="i-lucide-trending-up" class="inline align-[-2px] text-primary mr-2" />
                            Rejoignez les professionnels qui ont digitalisé leur facturation avec
                            <span class="text-primary font-medium">Invocloud</span>.
                        </p>
                    </UContainer>
                </UPageSection>

                <UPageSection>
                    <template #title>
                        <ul class="font-normal uppercase">
                            <li>FAQ</li>
                            <li>Contact</li>
                            <li>Politique de confidentialité</li>
                            <li>Newsletter</li>
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
        </UMain>

        <USeparator class="text-primary-100/15">
            <UIcon name="i-custom-invocloud-logo" class="text-primary size-10" />
        </USeparator>

        <UFooter>
            <p class="text-primary">Politique de confidentialité l Conditions générales d'utilisation © 2025 Invocloud.
                Tous
                droits réservés.
            </p>
        </UFooter>
    </UApp>
</template>
