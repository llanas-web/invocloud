<script setup lang="ts">
const { pending: userPending, isActive, isCanceled, subscription, actions: {
    activateSubscription,
    cancelSubscription,
} } = useUser()
const { actions: { createCheckoutSession } } = useAuth()
const { subscriptionPlans, pending: plansPending, error: plansError } = useSubscriptionPlan();

const { data: plans, pending } = useAsyncData(async () => {
    return queryCollection('plans').all();
}, { immediate: true, watch: [subscriptionPlans] });

const loading = computed(() => pending.value || plansPending.value || createCheckoutSession.pending.value || activateSubscription.pending.value || cancelSubscription.pending.value);

const onChangePlan = async (planId: string) => {
    await activateSubscription.execute({ subscriptionPlanId: planId });
};

const onCancel = async () => {
    await cancelSubscription.execute();
};

const onReactivate = async () => {
    await activateSubscription.execute({ subscriptionPlanId: subscription.value!.planId });
};

const onPlanSelect = async (planId: string) => {
    await createCheckoutSession.execute(planId);
};

const pricingPlans = computed(() => {
    return plans.value?.map((plan) => {
        const subscriptionPlan = subscriptionPlans.value?.find((p) => p.id === plan.plan_id);
        const subscriptionPlanFeatures = [];
        if (!subscriptionPlan || subscriptionPlan.hasOcrFeature) subscriptionPlanFeatures.push('OCR de factures');
        if (!subscriptionPlan || subscriptionPlan.hasInboundFeature) subscriptionPlanFeatures.push('Adresse email customisée');
        return {
            id: plan.plan_id,
            title: plan.title,
            description: plan.description,
            price: plan.price,
            features: [
                !subscriptionPlan?.maxEstablishments ? '∞ Établissements' : `${subscriptionPlan?.maxEstablishments} Établissement${subscriptionPlan?.maxEstablishments! > 1 ? 's' : ''}`,
                !subscriptionPlan?.maxMembers ? '∞ Utilisateurs' : `${subscriptionPlan?.maxMembers} Utilisateur${subscriptionPlan?.maxMembers! > 1 ? 's' : ''}`,
                !subscriptionPlan?.includedInvoicesPerMonth ? '∞ Factures' : `${subscriptionPlan?.includedInvoicesPerMonth} factures / mois`,
                "Interfaçage PDP",
                ...subscriptionPlanFeatures,
                ...(plan.features || []),
            ]
        };
    }) || [];
});
</script>

<template>
    <UPricingPlans orientation="horizontal" :loading="loading">
        <UPricingPlan v-for="plan in pricingPlans" :key="plan.id" v-bind="plan"
            :highlight="plan.id === subscription?.planId" :ui="{
                description: 'text-sm text-muted h-12',
            }">
            <template #button>
                <UButton v-if="subscription === null" label="Choisir ce plan" color="primary"
                    @click="onPlanSelect(plan.id)" :loading="loading" :disabled="loading" />

                <UButton v-else-if="plan.id === subscription!.planId" :label="isCanceled ? 'Réactiver' : 'Annuler'"
                    :color="isCanceled ? 'success' : 'error'" @click="isCanceled ? onReactivate() : onCancel()"
                    :loading="loading" :disabled="loading" />

                <UButton v-else label="Changer de plan" color="primary" @click="onChangePlan(plan.id)"
                    :loading="loading" :disabled="loading" />
            </template>
        </UPricingPlan>
    </UPricingPlans>
</template>