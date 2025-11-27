import z from "zod";

export const ListUserQueryFilterSchema = z.object({
    ids: z.array(z.uuid()).nonempty().optional(),
    emails: z.array(z.email().trim().min(1)).nonempty().optional(),
});
export type ListUserQueryFilter = z.infer<
    typeof ListUserQueryFilterSchema
>;
