import { z } from "zod";

export const sessionMetadataSchema = z.object({
    establishmentId: z.uuid(),
    userId: z.uuid(),
});

const createCheckoutSessionSchema = z.object({
    establishmentId: z.uuid(),
});

type SessionMetadata = z.infer<typeof sessionMetadataSchema>;
type CreateCheckoutSession = z.infer<typeof createCheckoutSessionSchema>;
