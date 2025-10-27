import { z } from "zod";

export const ResetPasswordBodySchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters long"),
});
export type ResetPasswordBody = z.infer<typeof ResetPasswordBodySchema>;
