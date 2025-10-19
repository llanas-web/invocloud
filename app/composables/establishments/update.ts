import { z } from "zod";
import { createSharedComposable } from "@vueuse/core";
import DatabaseFactory from "~~/shared/providers/database/database.factory";
import useAsyncAction from "../core/useAsyncAction";

export const UpdateEstablishmentSchema = z.object({
    name: z.string().min(1, "Name is required"),
    address: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    emailPrefix: z.string(),
});

export type UpdateEstablishmentForm = z.input<typeof UpdateEstablishmentSchema>;
export type UpdateEstablishmentCommand = z.output<
    typeof UpdateEstablishmentSchema
>;

const _useEstablishmentUpdate = () => {
    const { $databaseFactory } = useNuxtApp();
    const { establishmentRepository } = $databaseFactory as DatabaseFactory;
    const { selectedEstablishment, refresh } = useEstablishmentsList();

    const formRef = ref();

    const formState = reactive<UpdateEstablishmentForm>({
        name: "",
        address: null,
        phone: null,
        emailPrefix: "",
    });

    watch(
        () => selectedEstablishment.value,
        (newEstablishment) => {
            if (newEstablishment) {
                formState.name = newEstablishment.name;
                formState.address = newEstablishment.address;
                formState.phone = newEstablishment.phone;
                formState.emailPrefix = newEstablishment.emailPrefix;
            }
        },
    );
    const initialParsed = UpdateEstablishmentSchema.parse(formState);
    const isDirty = computed(() => {
        const currentParsed = UpdateEstablishmentSchema.parse(formState);
        return JSON.stringify(currentParsed) !== JSON.stringify(initialParsed);
    });

    const { error, pending, execute } = useAsyncAction(
        async () => {
            const parsedForm = UpdateEstablishmentSchema.parse(formState);
            if (!selectedEstablishment.value) {
                throw new Error("No establishment selected");
            }
            const updated = await establishmentRepository
                .updateEstablishment(
                    selectedEstablishment.value!.id,
                    parsedForm,
                );
            Object.assign(selectedEstablishment.value, updated);
            await refresh();
        },
    );

    const checkEmailPrefixAvailable = useAsyncAction(
        async (emailPrefix: string) => {
            const isAvailable = await establishmentRepository
                .isEmailPrefixAvailable(
                    emailPrefix,
                    selectedEstablishment.value?.id,
                );
            return isAvailable;
        },
    );

    return {
        formRef,
        formState,
        isDirty,
        error,
        pending,
        onSubmit: execute,
        checkEmailPrefixAvailable,
    };
};

export const useEstablishmentUpdate = createSharedComposable(
    _useEstablishmentUpdate,
);
