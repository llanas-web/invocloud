import { createSharedComposable } from "@vueuse/core";
import createEstablishmentRepository from "#shared/repositories/establishment.repository";
import type { Establishment, EstablishmentUpdate } from "~~/types";
import type { Database } from "~~/types/database.types";

const _useEstablishments = () => {
    const supabaseClient = useSupabaseClient<Database>();
    const establishmentRepository = createEstablishmentRepository(
        supabaseClient,
    );
    const user = useSupabaseUser();
    const selectedEstablishment = ref<Establishment | null>(null);
    const { userSettings } = useUserSettings();
    const loaded = ref(false);

    watch(() => selectedEstablishment.value, (newEstablishment) => {
        console.log("Selected establishment changed:", newEstablishment);
        if (newEstablishment && user.value) {
            localStorage.setItem("selectedEstablishment", newEstablishment.id);
        }
    }, { immediate: true });

    const selectEstablishment = (establishments: Establishment[]) => {
        let establishmentId: string | null = null;
        if (selectedEstablishment.value != null) {
            establishmentId = selectedEstablishment.value.id;
        } else if (localStorage.getItem("selectedEstablishment")) {
            establishmentId = localStorage.getItem("selectedEstablishment");
        } else if (userSettings.value?.favorite_establishment_id) {
            establishmentId = userSettings.value.favorite_establishment_id;
        } else {
            establishmentId = establishments[0]?.id || null;
        }
        console.log("Selected establishment ID:", establishmentId);
        selectedEstablishment.value = establishments.find(
            (est) => est.id === establishmentId,
        ) || null;
    };

    const { data: establishments, pending, refresh } = useAsyncData(
        "establishments",
        async () => {
            const { data, error } = await establishmentRepository
                .getEstablishmentsFromMemberId(user.value!.id);
            if (error) {
                console.error("Error fetching establishments:", error);
                return [];
            }
            const establishmentsData = data.map((item) => item.establishments);
            selectEstablishment(establishmentsData);
            loaded.value = true;
            return establishmentsData;
        },
        {
            immediate: true,
            server: false,
            default: () => [],
        },
    );

    const createEstablishment = async (name: string) => {
        const { data: newEstablishment, error } = await establishmentRepository
            .createEstablishment({
                name,
                creator_id: user.value!.id,
            });

        selectedEstablishment.value = newEstablishment;

        if (error) {
            return null;
        }
        refresh();
        return newEstablishment;
    };

    const isEmailPrefixAvailable = (email_prefix: string) => {
        return establishmentRepository
            .isEmailPrefixAvailable(
                email_prefix,
                selectedEstablishment.value?.id,
            );
    };

    const updateEstablishment = async (
        establishment: Partial<EstablishmentUpdate>,
    ) => {
        const { data, error } = await establishmentRepository
            .updateEstablishment(
                selectedEstablishment.value!.id,
                establishment,
            );
        if (!error && data) {
            await refresh();
        }
        return { data, error };
    };

    const subscribeToStripe = async () => {
        console.log(
            "Subscribing to Stripe for establishment:",
            selectedEstablishment.value,
        );
        const { url }: { url: string } = await $fetch(
            "/api/stripe/subscription/create",
            {
                method: "POST",
                body: {
                    establishmentId: selectedEstablishment.value?.id,
                },
            },
        );
        if (!url) {
            console.error(
                "Error creating Stripe subscription:",
            );
            return null;
        }
        window.location.href = url;
        return null;
    };

    const cancelStripeTrial = async () => {
        const { success, message }: { success: boolean; message: string } =
            await $fetch(
                "/api/stripe/trial/cancel",
                {
                    method: "POST",
                    body: {
                        establishmentId: selectedEstablishment.value?.id,
                    },
                },
            );
        if (!success) {
            console.error("Error canceling Stripe trial:", message);
        }
        return { success, message };
    };

    const cancelStripeSubscription = async () => {
        const { success, message }: { success: boolean; message: string } =
            await $fetch(
                "/api/stripe/subscription/cancel",
                {
                    method: "POST",
                    body: {
                        establishmentId: selectedEstablishment.value?.id,
                    },
                },
            );
        if (!success) {
            console.error(
                "Error canceling Stripe subscription:",
                message,
            );
        }
        return { success, message };
    };

    const deleteEstablishment = async () => {
        // First cancel any active subscriptions or trials
        if (selectedEstablishment.value?.subscription_status === "active") {
            await cancelStripeSubscription();
        } else if (
            selectedEstablishment.value?.subscription_status === "trialing"
        ) {
            await cancelStripeTrial();
        }
        return await establishmentRepository.deleteEstablishment(
            selectedEstablishment.value!.id,
        );
    };

    return {
        establishments,
        selectedEstablishment,
        pending,
        loaded,
        refresh,
        createEstablishment,
        updateEstablishment,
        subscribeToStripe,
        cancelStripeTrial,
        cancelStripeSubscription,
        deleteEstablishment,
        isEmailPrefixAvailable,
    };
};

export const useEstablishments = createSharedComposable(_useEstablishments);
