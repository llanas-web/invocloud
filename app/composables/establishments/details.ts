import { createSharedComposable } from "@vueuse/core";
import type { EstablishmentVM } from "~/ui/presenters/establishment.presenter";
import useAsyncAction from "../core/useAsyncAction";
import { AppError } from "~/core/errors/app.error";

const _useEstablishmentDetails = () => {
    const { $usecases } = useNuxtApp();
    const { selectedEstablishment, refresh } = useEstablishmentsList();

    const id = computed(() => selectedEstablishment.value?.id ?? null);
    const isSelected = computed(() => !!id.value);

    const deleteEstablishment = useAsyncAction(async () => {
        if (!id.value) throw new AppError("Aucun établissement sélectionné");
        await $usecases.establishments.delete.execute([id.value]);
        await refresh();
    });

    // Stripe actions
    const subscribeToStripe = async () => {
        if (!id.value) throw new AppError("Aucun établissement sélectionné");
        const { url }: { url: string } = await $fetch(
            "/api/stripe/subscription/create",
            {
                method: "POST",
                body: { establishmentId: id.value },
            },
        );
        if (!url) {
            console.error("Error creating Stripe subscription:");
            return null;
        }
        window.location.href = url;
        return null;
    };

    const cancelStripeTrial = async () => {
        if (!id.value) throw new Error("Aucun établissement sélectionné");
        const { success, message }: { success: boolean; message: string } =
            await $fetch("/api/stripe/trial/cancel", {
                method: "POST",
                body: { establishmentId: id.value },
            });
        if (!success) console.error("Error canceling Stripe trial:", message);
        return { success, message };
    };

    const cancelStripeSubscription = async () => {
        if (!id.value) throw new Error("Aucun établissement sélectionné");
        const { success, message }: { success: boolean; message: string } =
            await $fetch("/api/stripe/subscription/cancel", {
                method: "POST",
                body: { establishmentId: id.value },
            });
        if (!success) {
            console.error("Error canceling Stripe subscription:", message);
        }
        return { success, message };
    };

    return {
        id,
        establishment: selectedEstablishment as Ref<EstablishmentVM | null>,
        isSelected,
        refresh,
        actions: {
            deleteEstablishment,
        },
        subscribeToStripe,
        cancelStripeTrial,
        cancelStripeSubscription,
    };
};

export const useEstablishmentDetails = createSharedComposable(
    _useEstablishmentDetails,
);
