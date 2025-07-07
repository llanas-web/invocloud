<script setup lang="ts">
import { InvoicesUploadModalContainer } from '#components';
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui'

const schema = z.object({
    email: z.string().email('Veuillez entrer un email valide'),
});
const state = reactive({
    email: ''
});

type Schema = z.output<typeof schema>

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
    // Handle form submission logic here
    console.log('Form submitted with:', event);
};


const { data: page } = await useAsyncData(() => queryCollection('index').first())
const user = useSupabaseUser()
definePageMeta({
    layout: false,
})


const circles = ref([
    { radius: 100, startAngle: 0, endAngle: 288, color: '#9fc1ff', speed: '5s' },
    { radius: 85, startAngle: 90, endAngle: 378, color: '#9fc1ff', speed: '8s' },
    { radius: 70, startAngle: 180, endAngle: 468, color: '#9fc1ff', speed: '12s' },
])

/**
 * Génère le path d'un arc SVG
 */
const generateArcPath = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(cx, cy, r, startAngle)
    const end = polarToCartesian(cx, cy, r, endAngle)

    const largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? '0' : '1'

    return [
        'M', start.x, start.y,
        'A', r, r, 0, largeArcFlag, 1, end.x, end.y
    ].join(' ')
}

/**
 * Conversion polaire-cartésien
 */
const polarToCartesian = (cx: number, cy: number, r: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0

    return {
        x: cx + (r * Math.cos(angleInRadians)),
        y: cy + (r * Math.sin(angleInRadians))
    }
}
</script>


<template>
    <div class="absolute">
        <div class="relative w-screen min-h-screen">
            <!-- Your page content here -->

            <!-- Blur Disc 1 -->
            <div class="absolute w-96 h-96 rounded-full bg-[#5E73F7] opacity-80 blur-3xl"
                style="top: -30%; left: 50%; transform: translateX(-50%);"></div>
        </div>
    </div>
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
            <template #right>
                <UButton v-if="user != null && user.is_anonymous === false" to="/app" trailingIcon="i-lucide-home"
                    label="Dashboard" size="md" variant="ghost" :ui="{
                        label: 'hidden md:block'
                    }" />
                <UButton v-else label="Connexion" variant="ghost" :ui="{
                    label: 'hidden md:block'
                }" to="/auth/login" trailingIcon="i-lucide-log-in" size="md" />
                <InvoicesUploadModalContainer size="md" variant="ghost" />
            </template>
        </UHeader>

        <UMain>
            <div v-if="page">
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
                            trailingIcon="i-lucide-home" size="xl">Dashboard</UButton>
                        <UButton v-else to="/auth/login" trailingIcon="i-lucide-log-in" size="xl">
                            Connexion
                        </UButton>
                        <InvoicesUploadModalContainer />
                    </template>
                    <div class="relative min-h-80">
                        <!-- <img src="~/assets/images/big-btn-2.png"
                            class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" /> -->
                        <!-- <img src="~/assets/images/big-btn.png"
                            class="absolute size-64 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" /> -->
                        <img src="~/assets/images/hero-effect.png"
                            class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%]" />
                        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                            rounded-full size-52 bg-linear-150 from-primary/80 to-primary/90
                            drop-shadow-2xl drop-shadow-primary
                            opacity-80
                            "></div>
                        <svg class="absolute w-96 h-96 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                            viewBox="0 0 200 200">
                            <g v-for="(circle, index) in circles" :key="index">
                                <path :d="generateArcPath(100, 100, circle.radius, circle.startAngle, circle.endAngle)"
                                    :stroke="circle.color" stroke-width="1" fill="none"
                                    :class="`origin-center animate-rotate-${index}`" stroke-linecap="round" />

                                <!-- Point au début -->
                                <circle :cx="100 + circle.radius * Math.cos((circle.startAngle - 90) * Math.PI / 180)"
                                    :cy="100 + circle.radius * Math.sin((circle.startAngle - 90) * Math.PI / 180)"
                                    :r="1" :fill="circle.color" :class="`origin-center animate-rotate-${index}`" />
                            </g>
                        </svg>
                        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                            rounded-full border-2 border-primary size-40 bg-linear-150 from-white  to-80% to-primary/80
                            drop-shadow-xl drop-shadow-primary-800
                            bounce cursor-pointer">
                            <UIcon name="i-custom-invocloud-logo"
                                class="absolute  text-white size-24 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                        </div>
                    </div>
                </UPageHero>

                <UPageSection :title="page?.sections[0].title" :description="page?.sections[0].description" :ui="{
                    root: 'bg-muted text-muted',
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


                <UPageSection :title="page.pricing.title" :description="page.pricing.description" :ui="{
                    root: 'text-muted',
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
                                <UButton icon="i-simple-icons-x" variant="ghost" color="primary" size="lg" />
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

        <USeparator icon="i-custom-invocloud-logo" class="text-primary-100/15" />

        <UFooter>
            <p class="text-primary">Politique de confidentialité l Conditions générales d’utilisation © 2025 Invocloud.
                Tous
                droits réservés.
            </p>
        </UFooter>
    </UApp>
</template>

<style scoped>
@keyframes rotate {
    to {
        transform: rotate(360deg);
    }
}

.animate-rotate-0 {
    animation: rotate 5s linear reverse infinite;
}

.animate-rotate-1 {
    animation: rotate 8s linear reverse infinite;
}

.animate-rotate-2 {
    animation: rotate 12s linear reverse infinite;
}

@keyframes subtleBounce {

    0%,
    100% {
        transform: scale(100%);
    }

    50% {
        transform: scale(105%);
    }
}

.bounce {
    animation: subtleBounce 2s ease-in-out infinite;
}
</style>
