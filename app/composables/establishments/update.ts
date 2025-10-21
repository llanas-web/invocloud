import { z } from "zod";
import { createSharedComposable } from "@vueuse/core";
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
    const { $usecases } = useNuxtApp();
    const { refresh } = useEstablishmentsList();
    const { establishment } = useEstablishmentDetails();

    const formRef = ref();

    const formState = reactive<UpdateEstablishmentForm>({
        name: "",
        address: null,
        phone: null,
        emailPrefix: "",
    });

    watch(
        () => establishment.value,
        (newEstablishment) => {
            if (newEstablishment) {
                formState.name = newEstablishment.name;
                formState.address = newEstablishment.address;
                formState.phone = newEstablishment.phone;
                formState.emailPrefix = newEstablishment.emailPrefix;
            }
        },
    );

    const { error, pending, execute } = useAsyncAction(
        async () => {
            const parsedForm = UpdateEstablishmentSchema.parse(formState);
            await $usecases.establishments.update
                .execute({
                    id: establishment.value?.id,
                    ...parsedForm,
                });
            await refresh();
        },
    );

    const checkEmailPrefixAvailable = useAsyncAction(
        async (emailPrefix: string) => {
            return await $usecases.establishments
                .emailPrefixAvailable
                .execute({
                    emailPrefix,
                    excludeId: establishment.value?.id,
                });
        },
    );

    return {
        formRef,
        formState,
        error,
        pending,
        onSubmit: execute,
        checkEmailPrefixAvailable,
    };
};

export const useEstablishmentUpdate = createSharedComposable(
    _useEstablishmentUpdate,
);
