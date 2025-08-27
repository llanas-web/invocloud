<script setup lang="ts">
import { LazyInvoicesUploadModalContainer } from '#components';

const { openModal } = useInvoiceUpload()
const user = useSupabaseUser()

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
            <UButton label="Fonctionnalités" :to="{ path: '/', hash: '#features' }" size="md" variant="ghost" :ui="{
                label: 'hidden md:block'
            }" />
            <UButton label="Tarifs" :to="{ path: '/', hash: '#pricing' }" size="md" variant="ghost" :ui="{
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
                <template v-else>
                    <UButton label="Connexion" variant="solid" trailing-icon="i-lucide-log-in" :ui="{
                        label: 'hidden md:block'
                    }" to="/auth/login" size="md" />
                    <UButton label="Inscription" trailing-icon="i-lucide-user-plus" variant="solid" :ui="{
                        label: 'hidden md:block'
                    }" to="/auth/sign-up" size="md" />
                </template>
            </template>
        </UHeader>

        <UMain>
            <LazyInvoicesUploadModalContainer size="md" variant="ghost" />
            <slot></slot>
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