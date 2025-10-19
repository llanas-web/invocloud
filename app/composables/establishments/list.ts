import { createSharedComposable, useLocalStorage } from "@vueuse/core";
import type { EstablishmentModel } from "~~/shared/types/models/establishment.model";
import DatabaseFactory from "~~/shared/providers/database/database.factory";
import useAsyncAction from "../core/useAsyncAction";

function slugify(s: string) {
    return s.trim().toLowerCase().replace(/\s+/g, "-").replace(
        /[^a-z0-9-]/g,
        "",
    );
}

const _useEstablishmentsList = () => {
    const user = useSupabaseUser();
    const { userSettings } = useUserSettings();

    const { establishmentRepository } = inject(
        "databaseFactory",
    ) as DatabaseFactory;

    // --- State
    const selectedId = useLocalStorage<string | null>(
        "selectedEstablishmentId",
        null,
    );

    const key = computed(() => `establishments:${user.value?.id ?? "anon"}`);

    const {
        data: establishments,
        pending,
        refresh,
        error,
    } = useAsyncData(
        key,
        async () => {
            if (!user.value?.id) return [];
            const establishments = await establishmentRepository
                .getEstablishmentsFromMemberId(user.value.id);
            ensureSelection(establishments);
            return establishments;
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

    const deleteEstablishmentAction = useAsyncAction(
        async (id: string) => {
            await establishmentRepository
                .deleteEstablishment(
                    id,
                );
            establishments.value = establishments.value.filter((e) =>
                e.id !== id
            );
            if (selectedId.value === id) selectedId.value = null;
            refresh();
            return true;
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
        pending,
        error,

        // actions
        refresh,
        selectEstablishment,

        // CRUD actions
        deleteEstablishment: deleteEstablishmentAction,

        subscribeToStripe,
        cancelStripeTrial,
        cancelStripeSubscription,
    };
};

export const useEstablishmentsList = createSharedComposable(
    _useEstablishmentsList,
);
