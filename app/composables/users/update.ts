import { createSharedComposable } from "@vueuse/core";
import { z } from "zod";
import { AppError } from "~/core/errors/app.error";

export const UpdateUserSchema = z.object({
    fullName: z.string().nullable().optional(),
});
export type UpdateUserForm = z.input<typeof UpdateUserSchema>;
export type UpdateUserCommand = z.output<
    typeof UpdateUserSchema
>;

const _useUserUpdate = () => {
    const { $usecases } = useNuxtApp();
    const { currentUser, refresh } = useUser();

    const formState = reactive<UpdateUserForm>({
        fullName: "",
    });

    watch(currentUser, (newUser) => {
        if (newUser) {
            formState.fullName = newUser.fullName;
        }
    }, { immediate: true });

    const { error, pending, execute } = useAsyncAction(
        async () => {
            const parsedForm = UpdateUserSchema.parse(formState);
            if (!currentUser.value?.id) throw new AppError("No user id");
            await $usecases.users.update
                .execute({
                    id: currentUser.value.id,
                    fullName: parsedForm.fullName ?? undefined,
                });
            await refresh();
        },
        {
            successTitle: "Utilisateur mis à jour avec succès.",
            errorTitle: "Erreur lors de la mise à jour de l'utilisateur.",
        },
    );

    return {
        formState,
        error,
        pending,
        execute,
    };
};

export const useUserUpdate = createSharedComposable(_useUserUpdate);
