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
    const supabaseUser = useSupabaseUser();
    const { $usecases } = useNuxtApp();
    const { refresh, selectEstablishment } = useEstablishmentsList();
    const isOpen = ref(false);

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
                    creatorId: supabaseUser.value!.id,
                    emailPrefix: slugify(parsedEstablishment.name),
                });
            await refresh();
            selectEstablishment(newEstablishmentId);
            isOpen.value = false;
        },
    );

    return {
        formRef,
        isOpen,
        formState,
        newEstablishment,
        error,
        pending,
        onSubmit: execute,
    };
};

export const useEstablishmentCreate = createSharedComposable(
    _useEstablishmentCreate,
);
