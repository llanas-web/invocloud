<script setup lang="ts">
import { LazyInvoicesUploadModalContainer } from '#components';
import { fr } from '@nuxt/ui/locale'

const { openModal } = useUploadWizard()
const { connectedUser, isAuthenticated } = useAuth();

</script>

<template>
    <div class="absolute w-96 h-96 rounded-full bg-[#5E73F7] opacity-80 blur-3xl"
        style="top: -30%; left: 50%; transform: translateX(-50%);"></div>
    <UApp :locale="fr">
        <UHeader :toggle="false" :ui="{
            root: 'w-full',
            right: 'md:gap-4',
        }">
            <template #left>
                <NuxtLink to="/">
                    <div class="flex gap-4 h-8">
                        <UIcon name="i-custom:invocloud-logo" class="text-primary size-10" />
                        <UIcon name="i-custom:invocloud" class="text-primary h-10 " />
                    </div>
                </NuxtLink>
            </template>
            <template #right>
                <UButton label="Fonctionnalités" :to="{ path: '/', hash: '#features' }" size="md" variant="ghost" :ui="{
                    label: 'hidden lg:block'
                }" />
                <USeparator orientation="vertical" class="h-6 hidden lg:block" size="sm" />
                <UButton label="Tarifs" to="tarifs" size="md" variant="ghost" :ui="{
                    label: 'hidden lg:block'
                }" />
                <USeparator orientation="vertical" class="h-6 hidden lg:block" size="sm" />
                <UButton v-if="isAuthenticated" label="Tableau de bord" to="/app" trailingIcon="i-lucide-home" size="md"
                    variant="ghost" :ui="{
                        label: 'hidden lg:block'
                    }" />
                <template v-else>
                    <UButton label="Connexion" variant="ghost" trailing-icon="i-lucide-log-in" :ui="{
                        label: 'hidden md:block'
                    }" to="/auth/login" size="md" />
                    <UButton label="Inscription" trailing-icon="i-lucide-circle-plus" variant="ghost" :ui="{
                        label: 'hidden md:block'
                    }" to="/auth/sign-up" size="md" />
                </template>
                <UButton label="Envoyer des factures" trailing-icon="i-lucide-send" size="lg" variant="soft" :ui="{
                    label: 'hidden md:block',
                }" @click="openModal" />

            </template>
        </UHeader>

        <UMain>
            <LazyInvoicesUploadModalContainer size="md" variant="ghost" />
            <slot></slot>
        </UMain>

        <footer class="bg-gray-900 dark:bg-gray-950 border-t border-gray-800 pt-16 pb-8">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
                    <!-- Colonne 1: À propos -->
                    <div class="space-y-4">
                        <h3 class="text-lg font-bold text-white mb-4">
                            Invocloud
                        </h3>
                        <p class="text-sm text-gray-400 leading-relaxed">
                            La solution moderne pour gérer vos factures en toute simplicité. Conforme aux
                            réglementations
                            françaises.
                        </p>
                        <div class="flex items-center gap-3 pt-2">
                            <UButton icon="i-simple-icons-linkedin" color="gray" variant="ghost" size="sm" square
                                class="hover:bg-primary-500/10 hover:text-primary-400 transition-colors" />
                            <UButton icon="i-simple-icons-facebook" color="gray" variant="ghost" size="sm" square
                                class="hover:bg-primary-500/10 hover:text-primary-400 transition-colors" />
                            <UButton icon="i-simple-icons-instagram" color="gray" variant="ghost" size="sm" square
                                class="hover:bg-primary-500/10 hover:text-primary-400 transition-colors" />
                        </div>
                    </div>

                    <!-- Colonne 2: Liens rapides -->
                    <div class="space-y-4">
                        <h3 class="text-lg font-bold text-white mb-4">
                            Liens rapides
                        </h3>
                        <ul class="space-y-3">
                            <li>
                                <NuxtLink to="/faq"
                                    class="group flex items-center gap-2 text-sm text-gray-400 hover:text-primary-400 transition-colors">
                                    <UIcon name="i-lucide-chevron-right"
                                        class="size-4 group-hover:translate-x-1 transition-transform" />
                                    FAQ
                                </NuxtLink>
                            </li>
                            <li>
                                <NuxtLink to="/tarifs"
                                    class="group flex items-center gap-2 text-sm text-gray-400 hover:text-primary-400 transition-colors">
                                    <UIcon name="i-lucide-chevron-right"
                                        class="size-4 group-hover:translate-x-1 transition-transform" />
                                    Tarifs
                                </NuxtLink>
                            </li>
                            <li>
                                <NuxtLink to="/app"
                                    class="group flex items-center gap-2 text-sm text-gray-400 hover:text-primary-400 transition-colors">
                                    <UIcon name="i-lucide-chevron-right"
                                        class="size-4 group-hover:translate-x-1 transition-transform" />
                                    Tableau de bord
                                </NuxtLink>
                            </li>
                        </ul>
                    </div>

                    <!-- Colonne 3: Légal -->
                    <div class="space-y-4">
                        <h3 class="text-lg font-bold text-white mb-4">
                            Légal
                        </h3>
                        <ul class="space-y-3">
                            <li>
                                <NuxtLink to="/pdc"
                                    class="group flex items-center gap-2 text-sm text-gray-400 hover:text-primary-400 transition-colors">
                                    <UIcon name="i-lucide-chevron-right"
                                        class="size-4 group-hover:translate-x-1 transition-transform" />
                                    Politique de confidentialité
                                </NuxtLink>
                            </li>
                            <li>
                                <NuxtLink to="/cgu"
                                    class="group flex items-center gap-2 text-sm text-gray-400 hover:text-primary-400 transition-colors">
                                    <UIcon name="i-lucide-chevron-right"
                                        class="size-4 group-hover:translate-x-1 transition-transform" />
                                    Conditions d'utilisation
                                </NuxtLink>
                            </li>
                        </ul>
                    </div>

                    <!-- Colonne 4: Newsletter -->
                    <div class="space-y-4">
                        <h3 class="text-lg font-bold text-white mb-4">
                            Newsletter
                        </h3>
                        <p class="text-sm text-gray-400 mb-4">
                            Recevez nos dernières actualités
                        </p>
                        <div class="space-y-3">
                            <input type="email" placeholder="Votre email"
                                class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                            <UButton color="primary" size="md" block>
                                S'inscrire
                            </UButton>
                        </div>
                    </div>
                </div>

                <!-- Ligne de séparation -->
                <div class="border-t border-gray-800 pt-8">
                    <div class="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p class="text-sm text-gray-500">
                            © {{ new Date().getFullYear() }} Invocloud. Tous droits réservés.
                        </p>
                        <div class="flex items-center gap-2 text-sm text-gray-500">
                            <UIcon name="i-lucide-map-pin" class="size-4" />
                            <span>Made in France</span>
                            <span class="mx-2">•</span>
                            <UIcon name="i-lucide-mail" class="size-4" />
                            <a href="mailto:contact@invocloud.com" class="hover:text-primary-400 transition-colors">
                                contact@invocloud.com
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    </UApp>
</template>