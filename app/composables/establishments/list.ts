import { createSharedComposable, useLocalStorage } from "@vueuse/core";
import { EstablishmentListItemViewModel } from "~/viewmodels/establishment/establishment-list-item.vm";
import type { EstablishmentListItemDTO } from "~~/shared/application/establishment/dto";

const _useEstablishmentsList = () => {
    const { $usecases } = useNuxtApp();
    const { userSettings } = useUserSettings();
    const { user } = useAuth();

    const selectedId = useLocalStorage<string | null>(
        "selectedEstablishmentId",
        null,
    );

    const {
        data: dtos,
        pending,
        refresh,
        error,
        status,
    } = useAsyncData(
        async () => {
            if (!user.value?.id) return [];
            const list = await $usecases.establishments.list.execute(
                { memberIds: [user.value.id] },
            );
            ensureSelection(list);
            return list;
        },
        {
            immediate: true,
            default: () => [] as EstablishmentListItemDTO[],
            watch: [() => user.value?.id],
        },
    );

    const establishments = computed<EstablishmentListItemViewModel[]>(() =>
        dtos.value.map(EstablishmentListItemViewModel.fromDTO)
    );

    // --- Helpers sélection
    function exists(id?: string | null) {
        return !!id && dtos.value.some((e) => e.id === id);
    }

    // Accepte n’importe quelle liste avec un champ id
    function ensureSelection(list: { id: string }[]) {
        // ordre: selectedId → favori user → premier → null
        const candidate =
            (exists(selectedId.value)
                ? selectedId.value
                : (exists(userSettings.value?.favorite_establishment_id)
                    ? userSettings.value?.favorite_establishment_id
                    : list[0]?.id)) ?? null;

        selectedId.value = candidate;
    }

    /** Sélection explicite (id) */
    function selectEstablishment(id: string | null) {
        selectedId.value = exists(id) ? id : null;
        if (!selectedId.value) ensureSelection(dtos.value);
    }

    // Si la liste change et invalide la sélection, on retombe sur un fallback
    watch(dtos, (list) => {
        if (!exists(selectedId.value)) ensureSelection(list);
    });

    return {
        selectedId,
        establishments,
        pending,
        error,
        status,
        refresh,
        selectEstablishment,
    };
};

export const useEstablishmentsList = createSharedComposable(
    _useEstablishmentsList,
);
