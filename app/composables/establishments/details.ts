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
        data: dto,
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

    const establishment = computed<EstablishmentViewModel | null>(() => {
        if (!dto.value) return null;
        return new EstablishmentViewModel(dto.value);
    });

    const isSelected = computed(() => !!selectedId.value);

    const isAdmin = computed(() => {
        return establishment.value?.creatorId === user.value?.id;
    });

    const deleteAction = useAsyncAction(async () => {
        if (!selectedId.value) throw new AppError("No establishment selected");
        await $usecases.establishments.delete.execute([selectedId.value]);
        await refreshListEstablishments();
    });

    const createCheckoutSessionAction = useAsyncAction(
        async () => {
            if (!selectedId.value) {
                throw new AppError("No establishment selected");
            }
            await establishmentApi.subscription
                .createCheckoutSession({
                    establishmentId: selectedId.value,
                    userId: user.value!.id,
                });
        },
    );

    const cancelSubscriptionAction = useAsyncAction(
        async () => {
            if (!selectedId.value) {
                throw new AppError("No establishment selected");
            }
            await establishmentApi.subscription.cancel({
                establishmentId: selectedId.value,
            });
        },
    );

    return {
        dto,
        isSelected,
        isAdmin,
        establishment,
        pending,
        error,
        actions: {
            delete: deleteAction,
            createCheckoutSession: createCheckoutSessionAction,
            cancelSubscription: cancelSubscriptionAction,
        },
    };
};

export const useEstablishmentDetails = createSharedComposable(
    _useEstablishmentDetails,
);
