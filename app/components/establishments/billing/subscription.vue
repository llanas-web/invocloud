<script setup lang="ts">
    import { UBadge } from '#components';
    import { format } from 'date-fns';
    import { SubscriptionStatus } from '~~/shared/types/models/subscription.model';

    const { establishment: selectedEstablishment, subscribeToStripe, cancelStripeSubscription, cancelStripeTrial } = useEstablishmentDetails()

    const subscriptionStatus = computed(() => selectedEstablishment.value?.subscription?.status ?? null)

    const onUnsubscribe = async () => {
        await cancelStripeSubscription();
    }

    const onSubscribe = async () => {
        await subscribeToStripe();
    }

    const onTrialEnd = async () => {
        await cancelStripeTrial();
    }

    function trialEndDate() {
        const trialEnd = selectedEstablishment?.value?.subscription?.endAt;
        if (trialEnd) {
            // If trial_end is a timestamp (seconds), convert to ms
            const dateObj = typeof trialEnd === 'number' ? new Date(trialEnd * 1000) : new Date(trialEnd);
            return format(dateObj, 'dd/MM/yyyy');
        }
        return format(new Date(), 'dd/MM/yyyy');
    }
</script>

<template>
    <UPageCard v-if="subscriptionStatus === SubscriptionStatus.ACTIVE" id="subscriptions" variant="subtle" :ui="{
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
            <UButton @click="onUnsubscribe" color="error">
                Se désabonner
            </UButton>
        </template>
    </UPageCard>
    <UPageCard v-else-if="selectedEstablishment?.subscription?.status === SubscriptionStatus.TRIAL" id="subscriptions"
        variant="subtle" :ui="{
            header: 'flex items-center justify-between w-full',
        }">
        <template #header>
            <h2 class="text-lg font-semibold">Abonnement actuel</h2>
            <UBadge color="warning" icon="i-lucide:alert-triangle">
                Fin de période d'essai le {{ trialEndDate() }}
            </UBadge>
        </template>
        <template #body>
            Vous êtes actuellement en période d'essai.
            Votre période d'essai se termine le
            <strong>{{ trialEndDate() }}</strong>. Vous pouvez annuler votre période d'essai à tout moment.
        </template>
        <template #footer>
            <UButton @click="onTrialEnd" color="error">
                Arrêter la période d'essai
            </UButton>
        </template>
    </UPageCard>

    <UPageCard v-else id="subscriptions" variant="subtle" :ui="{
        header: 'flex items-center justify-between w-full',
    }">
        <template #body>
            Vous n'avez pas d'abonnement actif. Veuillez vous abonner pour accéder aux fonctionnalités premium.
        </template>
        <template #footer>
            <UButton @click="onSubscribe" color="primary">
                S'abonner
            </UButton>
        </template>
    </UPageCard>
</template>