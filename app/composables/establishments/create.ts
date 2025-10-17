import { z } from "zod";
import DatabaseFactory from "~~/shared/providers/database/database.factory";
import useAsyncAction from "../core/useAsyncAction";
import { createSharedComposable } from "@vueuse/core";

export const CreateEstablishmentSchema = z.string().min(1, "Name is required");

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
    const { getRepository } = inject("databaseFactory") as DatabaseFactory;
    const establishmentRepository = getRepository("establishmentRepository");
    const { establishments, refresh, selectEstablishment } =
        useEstablishmentsList();

    const formRef = ref();

    const formState = ref<CreateEstablishmentForm>("");

    const initialParsed = CreateEstablishmentSchema.parse(formState);
    const isDirty = computed(() => {
        const currentParsed = CreateEstablishmentSchema.parse(formState);
        return JSON.stringify(currentParsed) !== JSON.stringify(initialParsed);
    });

    const { data: newEstablishment, error, pending, execute } = useAsyncAction(
        async () => {
            const parsedEstablishment = CreateEstablishmentSchema.parse(
                formState,
            );
            const newEstablishment = await establishmentRepository
                .createEstablishment({
                    name: parsedEstablishment,
                    creatorId: supabaseUser.value!.id,
                    emailPrefix: slugify(parsedEstablishment),
                });
            establishments.value.push(newEstablishment);
            selectEstablishment(newEstablishment.id);
            await refresh();
        },
    );

    return {
        formRef,
        formState,
        isDirty,
        newEstablishment,
        error,
        pending,
        onSubmit: execute,
    };
};

export const useEstablishmentCreate = createSharedComposable(
    _useEstablishmentCreate,
);
