<script setup lang="ts">
    const { data: faq } = await useAsyncData(() => queryCollection('faq').first(), { server: true })

    const sectionDisplayed = ref<string[]>([])
    const config = useRuntimeConfig()

    onMounted(() => {
        const onObserve = (entry: IntersectionObserverEntry) => {
            if (entry.isIntersecting) {
                sectionDisplayed.value.push(entry.target.id)
            } else {
                sectionDisplayed.value = sectionDisplayed.value.filter((id) => id !== entry.target.id)
            }
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(onObserve)
        })
        faq.value!.body.toc!.links
            .map((link) => document.getElementById(link.id))
            .filter((element) => !!element)
            .forEach((section) => observer.observe(section))
    })

    useSeoMeta({
        title: 'FAQ - Invocloud',
        titleTemplate: 'FAQ - Invocloud',
        description: faq.value?.description,
        ogType: 'website',
        ogLocale: 'fr_FR',
        ogSiteName: 'Invocloud',
        ogTitle: 'FAQ - Invocloud',
        ogDescription: 'FAQ - Invocloud',
        ogUrl: `${config.public.baseUrl ?? 'https://invocloud.fr'}/faq`,
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
    <UPageHero orientation="horizontal" :ui="{ title: 'text-muted', root: 'bg-muted' }">
        <template #title>
            FAQ - <span class="text-primary">Invocloud</span>
        </template>
        <template #description>
            {{ faq?.description }}
        </template>
    </UPageHero>
    <UPage v-if="faq">
        <template #right>
            <UPageAside :ui="{ root: '' }">
                <ul class="space-y-2 font-bold min-w-0 ms-2.5 ps-4 border-s border-muted">
                    <li v-for="(link, index) in faq.body.toc?.links" :key="link.id" class="hover:text-muted"
                        :class="sectionDisplayed.includes(link.id) ? 'text-primary' : ''">
                        <NuxtLink :to="`#${link.id}`">{{ link.text }}</NuxtLink>
                    </li>
                </ul>
            </UPageAside>
        </template>
        <UPageSection>
            <ContentRenderer v-if="faq" :value="faq" />
        </UPageSection>
    </UPage>
</template>