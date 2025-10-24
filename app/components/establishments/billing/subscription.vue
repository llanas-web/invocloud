<script setup lang="ts">
    import { UBadge } from '#components';
    import { format } from 'date-fns';

    const { establishment, isAdmin, isTrial, isActive, subscription, actions } = useEstablishmentDetails()
</script>

<template>
    <UPageCard v-if="!subscription" id="subscriptions" variant="subtle" :ui="{
        header: 'flex items-center justify-between w-full',
    }">
        <template #body>
            Vous n'avez pas d'abonnement actif. Veuillez vous abonner pour accéder aux fonctionnalités premium.
        </template>
        <template #footer>
            <UButton @click="actions.createCheckoutSession.execute" color="primary">
                S'abonner
            </UButton>
        </template>
    </UPageCard>
    <UPageCard v-else-if="isActive" id="subscriptions" variant="subtle" :ui="{
        header: 'flex items-center justify-between w-full',
    }">
        <template #header>
            <h2 class="text-lg font-semibold">Abonnement actuel</h2>
            <UBadge color="success" icon="i-lucide:check-circle">
                En cours
            </UBadge>
        </template>
        <template #body>
            Votre abonnement est actif. Vous pouvez gérer votre abonnement dans votre compte Stripe.
        </template>
        <template #footer>
            <UButton @click="actions.cancelSubscription.execute" color="error">
                Se désabonner
            </UButton>
        </template>
    </UPageCard>
    <UPageCard v-else-if="isTrial" id="subscriptions" variant="subtle" :ui="{
        header: 'flex items-center justify-between w-full',
    }">
        <template #header>
            <h2 class="text-lg font-semibold">Abonnement actuel</h2>
            <UBadge color="warning" icon="i-lucide:alert-triangle">
                Fin de période d'essai le {{ subscription.endDateLabel }}
            </UBadge>
        </template>
        <template #body>
            Vous êtes actuellement en période d'essai.
            Votre période d'essai se termine le
            <strong>{{ subscription.endDateLabel }}</strong>. Vous pouvez annuler votre période d'essai à tout moment.
        </template>
        <template #footer>
            <UButton @click="actions.cancelSubscription.execute" color="error">
                Arrêter la période d'essai
            </UButton>
        </template>
    </UPageCard>
</template>