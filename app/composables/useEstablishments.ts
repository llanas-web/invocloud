import { createSharedComposable } from "@vueuse/core";
import type { Establishment, EstablishmentUpdate } from "~~/types";
import type { Database } from "~~/types/database.types";

const _useEstablishments = () => {
    const supabaseClient = useSupabaseClient<Database>();
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
            const { data, error } = await supabaseClient
                .from("establishment_members")
                .select("*, establishments(*)")
                .or(`user_id.eq.${user.value!.id}`);
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
        const { data: newEstablishment, error } = await supabaseClient
            .from("establishments")
            .insert([{
                name,
                creator_id: user.value!.id,
            }])
            .select().single();
        selectedEstablishment.value = newEstablishment;

        if (error) {
            console.error("Error creating establishment:", error);
            return null;
        }
        refresh();

        return newEstablishment;
    };

    const isEmailPrefixAvailable = async (email_prefix: string) => {
        const { data, error } = await supabaseClient
            .from("establishments")
            .select("id")
            .eq("email_prefix", email_prefix)
            .neq("id", selectedEstablishment.value!.id)
            .maybeSingle();

        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log(data);
        if (error) {
            console.error("Error checking email prefix availability:", error);
            return false;
        }
        return data === null;
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
        const { error } = await supabaseClient
            .from("establishments")
            .delete()
            .eq("id", selectedEstablishment.value!.id);
        await refresh();
        if (error) {
            console.error("Error deleting establishment:", error);
            return false;
        }
        return true;
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
