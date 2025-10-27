<script setup lang="ts">
    import { fr } from '@nuxt/ui/locale'

    const router = useRouter();
    const currentRoute = router.currentRoute;
    const { isAuthenticated } = useAuth();
    const { actions } = useAuth();

    const buttonLabel = computed(() => {
        if (isAuthenticated.value) {
            return 'Déconnexion';
        }
        return currentRoute.value.name === 'auth-login' ? 'S\'inscrire' : 'Connexion';
    });
    const redirectTo = computed(() => {
        if (isAuthenticated.value) {
            return '';
        }
        return currentRoute.value.name === 'auth-login' ? '/auth/sign-up' : '/auth/login';
    });
</script>

<template>
    <UApp :locale="fr" class="overflow-hidden relative">
        <div class="absolute h-screen w-screen overflow-hidden z-[-1]">
            <!-- Conteneur des décorations : n'affecte pas la hauteur -->
            <div class="absolute isolate h-[40%] rounded-full bg-[#5E73F7] opacity-80 blur-3xl aspect-square"
                style="top: -20%; left: 50%; transform: translateX(-50%);"></div>

            <div class="absolute isolate w-[50%] rounded-full bg-[#5E73F7] opacity-80 blur-3xl aspect-square"
                style="top: 110%; left: 0%; transform: translateX(-50%) translateY(-50%);"></div>
        </div>
        <UHeader :toggle="false">
            <template #left>
                <NuxtLink to="/">
                    <div class="flex gap-4 h-8">
                        <UIcon name="i-custom:invocloud-logo" class="text-primary size-10" />
                        <UIcon name="i-custom:invocloud" class="text-primary h-10" />
                    </div>
                </NuxtLink>
            </template>
            <template #right>
                <UButton v-if="isAuthenticated" :label="buttonLabel" variant="ghost" :ui="{ label: 'hidden md:block' }"
                    @click="actions.logout.execute" trailingIcon="i-lucide-log-out" size="md" />
                <UButton v-else :label="buttonLabel" variant="ghost" :ui="{ label: 'hidden md:block' }" :to="redirectTo"
                    trailingIcon="i-lucide-log-in" size="md" />
            </template>
        </UHeader>

        <UMain>
            <UContainer>
                <div class="h-[calc(100vh-var(--ui-header-height))] pb-12">
                    <slot />
                </div>
            </UContainer>
        </UMain>
    </UApp>
</template>
