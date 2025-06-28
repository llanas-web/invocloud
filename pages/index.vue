<script setup lang="ts">
import { InvoicesUploadModalContainer } from '#components';

const { data: page } = await useAsyncData(() => queryCollection('index').first())
const user = useSupabaseUser()
definePageMeta({
    layout: false,
})
</script>


<template>
    <UApp>
        <UHeader :toggle="false">
            <template #left>
                <NuxtLink to="/">
                    <h2 class="font-bold text-2xl">InvoCloud</h2>
                </NuxtLink>
            </template>
            <template #right>
                <UButton v-if="user != null && user.is_anonymous === false" to="/app" trailingIcon="i-lucide-home"
                    label="Dashboard" size="md" :ui="{
                        label: 'hidden md:block'
                    }" />
                <UButton v-else label="S'authentifier" :ui="{
                    label: 'hidden md:block'
                }" to="/auth/login" trailingIcon="i-lucide-log-in" size="md" />
                <InvoicesUploadModalContainer size="md" />
            </template>
        </UHeader>

        <UMain>
            <div v-if="page">
                <UPageHero :title="page.title" :description="page.description">
                    <template #links>
                        <UButton v-if="user != null && user.is_anonymous === false" to="/app"
                            trailingIcon="i-lucide-home" size="xl">Dashboard</UButton>
                        <UButton v-else to="/auth/login" trailingIcon="i-lucide-log-in" size="xl">
                            S'authentifier
                        </UButton>

                        <InvoicesUploadModalContainer />
                    </template>
                </UPageHero>

                <UPageSection :title="page?.sections[0].title" :description="page?.sections[0].description">
                    <UPageGrid>
                        <UPageCard v-for="(item, index) in page?.sections[0].features" :key="index" v-bind="item"
                            spotlight />
                    </UPageGrid>
                </UPageSection>


                <UPageSection :title="page.pricing.title" :description="page.pricing.description">
                    <UContainer>
                        <UPricingPlans scale>
                            <UPricingPlan v-for="(plan, index) in page.pricing.plans" :key="index" v-bind="plan" />
                        </UPricingPlans>
                    </UContainer>
                </UPageSection>
            </div>
        </UMain>

        <USeparator icon="i-simple-icons-nuxtdotjs" />

        <UFooter>
            <template #left>
                <p class="text-sm text-muted">
                    Copyright © {{ new Date().getFullYear() }}
                </p>
            </template>

            <template #right>
                <UButton to="https://github.com/nuxt-ui-pro/starter" target="_blank" icon="i-simple-icons-github"
                    aria-label="GitHub" color="neutral" variant="ghost" />
            </template>
        </UFooter>
    </UApp>
</template>
