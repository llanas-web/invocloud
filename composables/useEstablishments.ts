import { createSharedComposable } from "@vueuse/core";
import type { Establishment, EstablishmentUpdate } from "~/types";

const _useEstablishments = () => {
    const supabaseClient = useSupabaseClient();
    const user = useSupabaseUser();
    const selectedEstablishment = ref<Establishment | null>(null);
    const { userSettings } = useUserSettings();

    const { data: establishments, pending, refresh } = useAsyncData(
        "establishments",
        async () => {
            const { data, error } = await supabaseClient
                .from("establishments")
                .select("*")
                .eq("creator_id", user.value!.id);

            if (error) {
                console.error("Error fetching establishments:", error);
                return [];
            }
            if (
                !selectedEstablishment.value &&
                userSettings.value?.favorite_establishment_id
            ) {
                selectedEstablishment.value = data.find((est) =>
                    est.id === userSettings.value.favorite_establishment_id
                ) || null;
            } else if (selectedEstablishment.value != null) {
                selectedEstablishment.value = data.find((est) =>
                    est.id === selectedEstablishment.value!.id
                ) || null;
            }
            return data;
        },
        {
            immediate: true,
            server: true,
            default: () => [],
        },
    );

    const createEstablishment = async (name: string) => {
        const { data: newEstablishment, error } = await supabaseClient
            .from("establishments")
            .insert([{
                name,
                creator_id: user.value!.id,
            }])
            .select().single();

        if (error) {
            console.error("Error creating establishment:", error);
            return null;
        }
        refresh();

        return newEstablishment;
    };

    const updateEstablishment = async (
        establishment: Partial<EstablishmentUpdate>,
    ) => {
        const { data, error } = await supabaseClient.from("establishments")
            .update(establishment)
            .eq("id", selectedEstablishment.value!.id)
            .select()
            .single();
        if (!error && data) {
            await refresh();
        }
        return { data, error };
    };

    const subscribeToStripe = async () => {
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

    return {
        establishments,
        selectedEstablishment,
        pending,
        refresh,
        createEstablishment,
        updateEstablishment,
        subscribeToStripe,
        cancelStripeTrial,
        cancelStripeSubscription,
    };
};

export const useEstablishments = createSharedComposable(_useEstablishments);
