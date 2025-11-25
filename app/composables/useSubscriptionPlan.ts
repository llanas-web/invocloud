import { createSharedComposable } from "@vueuse/core";

const _useSubscriptionPlan = () => {
    const { $queries } = useNuxtApp();
    const { subscription } = useUser();
    const { establishments } = useEstablishmentsList();

    const { data: subscriptionPlans, pending, error } = useAsyncData(
        async () => {
            return $queries.subscriptionPlanQuery
                .listAll();
        },
        {
            immediate: true,
        },
    );

    const activePlan = computed(() => {
        return subscriptionPlans.value?.find(
            (plan) => plan.id === subscription.value?.planId,
        ) || null;
    });

    const canCreateEstablishment = computed(() => {
        return activePlan.value
            ? activePlan.value.maxEstablishments >
                (establishments.value?.length || 0)
            : false;
    });

    return {
        subscriptionPlans,
        pending,
        error,
        canCreateEstablishment,
    };
};
export const useSubscriptionPlan = createSharedComposable(_useSubscriptionPlan);
