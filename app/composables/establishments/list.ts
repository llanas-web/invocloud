import { createSharedComposable, useLocalStorage } from "@vueuse/core";
import { AppError } from "~/core/errors/app.error";
import type { EstablishmentListItemDTO } from "~~/shared/application/establishment/dto";

const _useEstablishmentsList = () => {
    const { $queries } = useNuxtApp();
    const { userSettings } = useUser();
    const { connectedUser } = useAuth();

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
            try {
                if (!connectedUser.value?.id) return [];
                return $queries.establishmentQuery.listEstablishments(
                    { memberIds: [connectedUser.value.id] },
                );
            } catch (err) {
                throw AppError.fromUnknownError(err);
            }
        },
        {
            server: false,
            default: () => [] as EstablishmentListItemDTO[],
            watch: [() => connectedUser.value],
        },
    );

    const establishments = computed(() =>
        dtos.value.map((dto) => ({
            id: dto.id,
            name: dto.name,
            emailPrefix: dto.emailPrefix,
        }))
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
                : (exists(userSettings.value?.favoriteEstablishmentId)
                    ? userSettings.value?.favoriteEstablishmentId
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
