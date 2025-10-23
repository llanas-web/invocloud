import { z } from "zod";

export const UpdateUserDetailsSchema = z.object({
    id: z.uuid(),
    fullName: z.string().min(1).optional(),
});
export type UpdateUserDetailsCommand = z.input<
    typeof UpdateUserDetailsSchema
>;
