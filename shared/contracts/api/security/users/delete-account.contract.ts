import { z } from "zod";

export const DeleteAccountBodySchema = z.object({
    userId: z.uuid(),
});
export type DeleteAccountBody = z.infer<typeof DeleteAccountBodySchema>;
