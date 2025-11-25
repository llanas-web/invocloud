import { createSharedComposable } from "@vueuse/core";

const _useSubscriptionPlan = () => {
    const { $queries } = useNuxtApp();

    const { data: subscriptionPlans, pending, error } = useAsyncData(
        async () => {
            return $queries.subscriptionPlanQuery
                .listAll();
        },
        {
            immediate: true,
        },
    );

    return {
        subscriptionPlans,
        pending,
        error,
    };
};
export const useSubscriptionPlan = createSharedComposable(_useSubscriptionPlan);
