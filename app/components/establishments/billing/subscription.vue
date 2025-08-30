<script setup lang="ts">
import { UBadge } from '#components';
import { format } from 'date-fns';

const { selectedEstablishment, subscribeToStripe, cancelStripeSubscription, cancelStripeTrial } = useEstablishments()

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
    const trialEnd = selectedEstablishment?.value?.trial_end;
    if (trialEnd) {
        // If trial_end is a timestamp (seconds), convert to ms
        const dateObj = typeof trialEnd === 'number' ? new Date(trialEnd * 1000) : new Date(trialEnd);
        return format(dateObj, 'dd/MM/yyyy');
    }
    return format(new Date(), 'dd/MM/yyyy');
}
</script>

<template>
    <UPageCard id="subscriptions" variant="subtle" :ui="{
        header: 'flex items-center justify-between w-full',
    }">
        <template #header>
            <h2 class="text-lg font-semibold">Abonnement actuel</h2>
            <template v-if="selectedEstablishment?.subscription_status === 'active'">
                <UBadge v-if="selectedEstablishment?.subscription_status" color="success" icon="i-lucide:check-circle">
                    En cours
                </UBadge>
            </template>
            <template v-else-if="selectedEstablishment?.subscription_status === 'trialing'">
                <UBadge v-if="selectedEstablishment?.subscription_status" color="warning"
                    icon="i-lucide:alert-triangle">
                    Fin de période d'essai le {{ trialEndDate() }}
                </UBadge>
            </template>
        </template>
        <template #body>
            <template v-if="selectedEstablishment?.subscription_status === 'active'">
                Votre abonnement est actif. Vous pouvez gérer votre abonnement dans votre compte Stripe.
            </template>
            <template v-else-if="selectedEstablishment?.subscription_status === 'trialing'">
                Vous êtes actuellement en période d'essai.
                Votre période d'essai se termine le
                <strong>{{ trialEndDate() }}</strong>. Vous pouvez annuler votre période d'essai à tout moment.
            </template>
            <template v-else>
                Vous n'avez pas d'abonnement actif. Veuillez vous abonner pour accéder aux fonctionnalités premium.
            </template>
        </template>

        <template #footer>
            <UButton v-if="selectedEstablishment?.subscription_status === 'active'" @click="onUnsubscribe"
                color="error">
                Se désabonner
            </UButton>
            <UButton v-else-if="selectedEstablishment?.subscription_status === 'trialing'" @click="onTrialEnd"
                color="error">
                Arrêter la période d'essai
            </UButton>
            <UButton v-else @click="onSubscribe" color="primary">
                S'abonner
            </UButton>
        </template>
    </UPageCard>
</template>