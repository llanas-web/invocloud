import { createSharedComposable } from "@vueuse/core";
import useAsyncAction from "../core/useAsyncAction";
import { AppError } from "~/core/errors/app.error";
import { EstablishmentViewModel } from "~/viewmodels/establishment/establishment.vm";
import { establishmentApi } from "~/services/api/establishment.api";

const _useEstablishmentDetails = () => {
    const { $usecases } = useNuxtApp();
    const { selectedId, refresh: refreshListEstablishments } =
        useEstablishmentsList();
    const { user } = useAuth();

    const {
        data: model,
        error,
        pending,
    } = useAsyncData(
        async () => {
            if (!selectedId.value) return null;
            return await $usecases.establishments.details.execute(
                selectedId.value,
            );
        },
        {
            immediate: true,
            default: () => null,
            watch: [selectedId],
        },
    );

    const getSelectedId = () => {
        if (!selectedId.value) {
            throw new AppError("Aucun établissement sélectionné");
        }
        return selectedId.value;
    };

    const establishment = computed<EstablishmentViewModel | null>(() => {
        if (!model.value) return null;
        return new EstablishmentViewModel(model.value);
    });

    const isSelected = computed(() => !!selectedId.value);

    const deleteAction = useAsyncAction(async () => {
        await $usecases.establishments.delete.execute([getSelectedId()]);
        await refreshListEstablishments();
    });

    const createCheckoutSessionAction = useAsyncAction(
        async () => {
            window.location.href = await establishmentApi.subscription
                .createCheckoutSession({
                    establishmentId: getSelectedId(),
                    userId: user.value!.id,
                });
        },
    );

    const cancelStripeTrial = async () => {
        if (!selectedId.value) {
            throw new Error("Aucun établissement sélectionné");
        }
        const { success, message }: { success: boolean; message: string } =
            await $fetch("/api/stripe/trial/cancel", {
                method: "POST",
                body: { establishmentId: selectedId.value },
            });
        if (!success) console.error("Error canceling Stripe trial:", message);
        return { success, message };
    };

    const cancelStripeSubscription = async () => {
        if (!selectedId.value) {
            throw new Error("Aucun établissement sélectionné");
        }
        const { success, message }: { success: boolean; message: string } =
            await $fetch("/api/stripe/subscription/cancel", {
                method: "POST",
                body: { establishmentId: selectedId.value },
            });
        if (!success) {
            console.error("Error canceling Stripe subscription:", message);
        }
        return { success, message };
    };

    return {
        model,
        isSelected,
        establishment,
        pending,
        error,
        actions: {
            delete: deleteAction,
            createCheckoutSession: createCheckoutSessionAction,
        },
        cancelStripeTrial,
        cancelStripeSubscription,
    };
};

export const useEstablishmentDetails = createSharedComposable(
    _useEstablishmentDetails,
);
