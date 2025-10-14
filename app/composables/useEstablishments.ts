import type { Database } from "#build/types/supabase-database";
import { createSharedComposable } from "@vueuse/core";
import type { EstablishmentModel } from "~~/shared/models/establishment.model";
import DatabaseFactory from "~~/shared/providers/database/database-factory";

const _useEstablishments = () => {
    const supabaseClient = useSupabaseClient<Database>();
    const { getRepository } = DatabaseFactory.getInstance(supabaseClient);
    const establishmentRepository = getRepository("establishmentRepository");
    const user = useSupabaseUser();
    const selectedEstablishment = ref<EstablishmentModel | null>(null);
    const { userSettings } = useUserSettings();
    const loaded = ref(false);

    watch(() => selectedEstablishment.value, (newEstablishment) => {
        console.log("Selected establishment changed:", newEstablishment);
        if (newEstablishment && user.value) {
            localStorage.setItem("selectedEstablishment", newEstablishment.id);
        }
    }, { immediate: true });

    const selectEstablishment = (establishments: EstablishmentModel[]) => {
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
            const establishements = await establishmentRepository
                .getEstablishmentsFromMemberId(user.value!.id);
            selectEstablishment(establishements);
            loaded.value = true;
            return establishements;
        },
        {
            immediate: true,
            server: false,
            default: () => [],
        },
    );

    const createEstablishment = async (name: string) => {
        const newEstablishment = await establishmentRepository
            .createEstablishment({
                name,
                creatorId: user.value!.id,
                emailPrefix: name.toLowerCase().replace(/\s+/g, "-"),
            });

        selectedEstablishment.value = newEstablishment;
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
