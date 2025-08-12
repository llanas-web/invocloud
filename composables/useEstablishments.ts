import { createSharedComposable } from "@vueuse/core";
import type { Establishment, EstablishmentUpdate } from "~/types";

const _useEstablishments = () => {
    const supabaseClient = useSupabaseClient();
    const user = useSupabaseUser();
    const selectedEstablishment = ref<Establishment | null>(null);
    const { userSettings } = useUserSettings();

    watch(() => selectedEstablishment.value, (newEstablishment) => {
        console.log("Selected establishment changed:", newEstablishment);
        if (newEstablishment) {
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
            const { data, error } = await supabaseClient
                .from("establishment_members")
                .select("*, establishments(*)")
                .or(`user_id.eq.${user.value!.id}`);

            if (error) {
                console.error("Error fetching establishments:", error);
                return [];
            }
            const establishmentsData = data.map((item: any) =>
                item.establishments
            );
            selectEstablishment(establishmentsData);
            return establishmentsData;
        },
        {
            immediate: true,
            server: false,
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
