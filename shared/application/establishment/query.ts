import { z } from "zod";

export const EstablishementListQuerySchema = z.object({
    ids: z.array(z.uuid()).nonempty().optional(),
    memberIds: z.array(z.uuid()).nonempty().optional(),
    emailPrefixes: z.array(z.string().trim().min(1)).nonempty().optional(),
});
