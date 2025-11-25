<script setup lang="ts">

const toast = useToast();
const { pending, isActive, isCanceled, subscription, actions: {
    activateSubscription,
    cancelSubscription,
} } = useUser()
const { actions: { createCheckoutSession } } = useAuth()

const { data: plansData, pending: plansPending } = useAsyncData(async () => {
    const _planData = await queryCollection('plans').all()
    return _planData.map((plan) => {
        const establishmentLabel = plan.establisments === null ? '∞ Établissements' : `${plan.establisments} Établissement${plan.establisments > 1 ? 's' : ''}`;
        const usersLabel = plan.users === null ? '∞ Utilisateurs' : `${plan.users} Utilisateur${plan.users > 1 ? 's' : ''}`;
        const invoicesLabel = plan['monthly-invoices'] === null ? '∞ Factures' : `${plan['monthly-invoices']} factures / mois`;
        const isSubscribedToPlan = subscription.value?.planId === plan.plan_id;
        const badgeLabel = isSubscribedToPlan ? `Jusqu'au ${subscription.value.endDateLabel}` : undefined;
        return {
            id: plan.plan_id,
            title: plan.title,
            description: plan.description,
            price: plan.price,
            badge: badgeLabel,
            features: [
                establishmentLabel,
                usersLabel,
                invoicesLabel,
                "Interfaçage PDP",
                ...(plan.features || []),
            ],
        }
    })
})

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
</script>

<template>
    <UPricingPlans orientation="horizontal" :loading="loading">
        <UPricingPlan v-for="plan in plansData" :key="plan.id" v-bind="plan" :title="plan.title"
            :description="plan.description" :highlight="plan.id === subscription?.planId" :ui="{
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