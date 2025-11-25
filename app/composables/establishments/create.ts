import { z } from "zod";
import useAsyncAction from "../core/useAsyncAction";
import { createSharedComposable } from "@vueuse/core";

export const CreateEstablishmentSchema = z.object({
    name: z.string().min(1, "Name is required"),
});

export type CreateEstablishmentForm = z.input<typeof CreateEstablishmentSchema>;
export type CreateEstablishmentCommand = z.output<
    typeof CreateEstablishmentSchema
>;

function slugify(s: string) {
    return s.trim().toLowerCase().replace(/\s+/g, "-").replace(
        /[^a-z0-9-]/g,
        "",
    );
}

const _useEstablishmentCreate = () => {
    const { $usecases } = useNuxtApp();
    const { connectedUser } = useAuth();
    const { refresh, selectEstablishment } = useEstablishmentsList();
    const { canCreateEstablishment } = useSubscriptionPlan();
    const isOpen = ref(false);
    const toast = useToast();

    const formRef = ref();

    const formState = ref<CreateEstablishmentForm>({
        name: "",
    });

    const { data: newEstablishment, error, pending, execute } = useAsyncAction(
        async () => {
            const parsedEstablishment = CreateEstablishmentSchema.parse(
                formState.value,
            );
            const newEstablishmentId = await $usecases.establishments.create
                .execute({
                    name: parsedEstablishment.name,
                    creatorId: connectedUser.value!.id,
                    emailPrefix: slugify(parsedEstablishment.name),
                });
            await refresh();
            selectEstablishment(newEstablishmentId);
            isOpen.value = false;
        },
        {
            successTitle: "Établissement créé avec succès.",
            errorTitle: "Erreur lors de la création de l'établissement.",
        },
    );

    const openEstablishmentCreate = () => {
        if (canCreateEstablishment.value) {
            isOpen.value = true;
        } else {
            toast.add({
                title: "Limite d'établissements atteinte",
                description:
                    "Vous avez atteint la limite d'établissements pour votre plan actuel. Veuillez mettre à niveau votre abonnement pour en ajouter plus.",
                color: "warning",
                icon: "i-lucide:alert-triangle",
                actions: [{
                    label: "Voir les plans",
                    onClick: () => {
                        navigateTo("/app/settings/billing");
                    },
                }],
            });
        }
    };

    return {
        formRef,
        isOpen,
        formState,
        newEstablishment,
        error,
        pending,
        openEstablishmentCreate,
        onSubmit: execute,
    };
};

export const useEstablishmentCreate = createSharedComposable(
    _useEstablishmentCreate,
);
