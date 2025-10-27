import z from "zod";

export const CheckPrefixBodySchema = z.object({
    prefix: z.string().min(1, "Prefix is required"),
    excludeEstablishmentId: z.uuid().optional(),
});
export const CheckPrefixResponseSchema = z.object({
    isAvailable: z.boolean(),
});

export type CheckPrefixBody = z.infer<typeof CheckPrefixBodySchema>;
export type CheckPrefixResponse = z.infer<
    typeof CheckPrefixResponseSchema
>;
