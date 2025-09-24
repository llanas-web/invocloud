<script setup lang="ts">
    const { data: cgu } = await useAsyncData(() => queryCollection('cgu').first(), { server: true })

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
        cgu.value!.body.toc!.links
            .map((link) => document.getElementById(link.id))
            .filter((element) => !!element)
            .forEach((section) => observer.observe(section))
    })

    useSeoMeta({
        title: 'Condition Générales d\'Utilisation - Invocloud',
        titleTemplate: 'Condition Générales d\'Utilisation - Invocloud',
        description: cgu.value?.description,
        ogType: 'website',
        ogLocale: 'fr_FR',
        ogSiteName: 'Invocloud',
        ogTitle: 'Condition Générales d\'Utilisation - Invocloud',
        ogDescription: cgu.value?.description,
        ogUrl: `${config.public.baseUrl ?? 'https://invocloud.fr'}/cgu`,
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
    <UPageHero orientation="horizontal" :ui="{ title: 'text-muted', root: 'bg-muted', description: 'italic' }">
        <template #title>
            Condition Générales d'Utilisation - <span class="text-primary">Invocloud</span>
        </template>
        <template #description>
            {{ cgu?.description }}
        </template>
    </UPageHero>
    <UPage v-if="cgu">
        <template #right>
            <UPageAside :ui="{ root: '' }">
                <ul class="space-y-2 font-bold min-w-0 ms-2.5 ps-4 border-s border-muted">
                    <li v-for="(link, index) in cgu.body.toc?.links" :key="link.id" class="hover:text-muted"
                        :class="sectionDisplayed.includes(link.id) ? 'text-primary' : ''">
                        <NuxtLink :to="`#${link.id}`">{{ link.text }}</NuxtLink>
                    </li>
                </ul>
            </UPageAside>
        </template>
        <UPageSection>
            <ContentRenderer v-if="cgu" :value="cgu" />
        </UPageSection>
    </UPage>
</template>