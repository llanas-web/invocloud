import type { Database } from "#build/types/supabase-database";
import { createSharedComposable, useLocalStorage } from "@vueuse/core";
import type { EstablishmentModel } from "~~/shared/models/establishment.model";
import DatabaseFactory from "~~/shared/providers/database/database-factory";
import type { EstablishmentUpdate } from "~~/types/providers/database";
import useAsyncAction from "./core/useAsyncAction";

function slugify(s: string) {
    return s.trim().toLowerCase().replace(/\s+/g, "-").replace(
        /[^a-z0-9-]/g,
        "",
    );
}

const _useEstablishments = () => {
    const supabase = useSupabaseClient<Database>();
    const user = useSupabaseUser();
    const { userSettings } = useUserSettings();

    const { getRepository } = DatabaseFactory.getInstance(supabase);
    const establishmentRepository = getRepository("establishmentRepository");

    // --- State
    const selectedId = useLocalStorage<string | null>(
        "selectedEstablishmentId",
        null,
    );

    const key = computed(() => `establishments:${user.value?.id ?? "anon"}`);
    const fetchError = ref<unknown>(null);

    const {
        data: establishments,
        pending: pendingFetch,
        refresh,
    } = useAsyncData(
        key,
        async () => {
            fetchError.value = null;
            if (!user.value?.id) return [];
            const res = await establishmentRepository
                .getEstablishmentsFromMemberId(user.value.id);
            if (!res.ok) {
                fetchError.value = res.error;
                return [];
            }
            // (ré)initialise la sélection quand la liste arrive
            ensureSelection(res.value);
            return res.value;
        },
        {
            server: false,
            immediate: true,
            default: () => [] as EstablishmentModel[],
            watch: [() => user.value?.id],
        },
    );

    // Sélection dérivée (pas de double source de vérité)
    const selectedEstablishment = computed<EstablishmentModel | null>(() => {
        if (!selectedId.value) return null;
        return establishments.value.find((e) => e.id === selectedId.value) ??
            null;
    });

    // --- Helpers sélection
    function exists(id?: string | null) {
        return !!id && establishments.value.some((e) => e.id === id);
    }

    function ensureSelection(list: EstablishmentModel[]) {
        // ordre: selectedId → favori user → premier → null
        const candidate =
            (exists(selectedId.value)
                ? selectedId.value
                : (exists(userSettings.value?.favorite_establishment_id)
                    ? userSettings.value?.favorite_establishment_id
                    : list[0]?.id)) ?? null;

        selectedId.value = candidate;
    }

    /** Sélectionne explicitement un établissement (id) */
    function selectEstablishment(id: string | null) {
        selectedId.value = exists(id) ? id : null;
        if (!selectedId.value) ensureSelection(establishments.value);
    }

    // Si la liste change et invalide la sélection, on retombe sur un fallback
    watch(establishments, (list) => {
        if (!exists(selectedId.value)) ensureSelection(list);
    });

    // --- Actions states
    const createEstablishmentAction = useAsyncAction(
        async (name: string) => {
            const body = {
                name,
                creatorId: user.value?.id ?? "",
                emailPrefix: slugify(name),
            };
            const result = await establishmentRepository.createEstablishment(
                body,
            );
            if (!result.ok) throw result.error;
            establishments.value.push(result.value);
            selectedId.value = result.value.id;
            refresh();
            return result.value;
        },
    );

    const updateEstablishmentAction = useAsyncAction(
        async (patch: Partial<EstablishmentUpdate>) => {
            const estId = selectedId.value;
            if (!estId) throw new Error("No establishment selected");
            const result = await establishmentRepository.updateEstablishment(
                estId,
                patch,
            );
            if (!result.ok) throw result.error;
            const updatedEstablishment = result.value;
            const i = establishments.value.findIndex((e) =>
                e.id === updatedEstablishment.id
            );
            if (i >= 0) establishments.value[i] = updatedEstablishment;
            return updatedEstablishment;
        },
    );

    const deleteEstablishmentAction = useAsyncAction(
        async (id: string) => {
            const result = await establishmentRepository.deleteEstablishment(
                id,
            );
            if (!result.ok) throw result.error;
            establishments.value = establishments.value.filter((e) =>
                e.id !== id
            );
            if (selectedId.value === id) selectedId.value = null;
            refresh();
            return true;
        },
    );

    const checkEmailPrefixAvailable = useAsyncAction(
        async (emailPrefix: string, excludeEstablishmentId?: string) => {
            const result = await establishmentRepository.isEmailPrefixAvailable(
                emailPrefix,
                excludeEstablishmentId,
            );
            if (!result.ok) throw result.error;
            return result.value;
        },
    );

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

    return {
        // data
        establishments,
        selectedEstablishment,

        // fetch states
        pendingFetch,
        fetchError,

        // actions
        refresh,
        selectEstablishment,

        // CRUD actions
        createEstablishment: createEstablishmentAction,
        updateEstablishment: updateEstablishmentAction,
        deleteEstablishment: deleteEstablishmentAction,

        // Async actions
        checkEmailPrefixAvailable: checkEmailPrefixAvailable,

        subscribeToStripe,
        cancelStripeTrial,
        cancelStripeSubscription,
    };
};

export const useEstablishments = createSharedComposable(_useEstablishments);
