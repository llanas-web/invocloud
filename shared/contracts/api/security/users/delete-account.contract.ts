import { z } from "zod";

export const DeleteAccountSchema = z.object({
    userId: z.uuid(),
});
export type DeleteAccountCommand = z.infer<typeof DeleteAccountSchema>;
