import { z } from "zod";

const sessionMetadataSchema = z.object({
    userId: z.string().uuid(),
    establishmentId: z.string().uuid(),
});

const createCheckoutSessionSchema = z.object({
    establishmentId: z.string().uuid(),
});

type SessionMetadata = z.infer<typeof sessionMetadataSchema>;
type CreateCheckoutSession = z.infer<typeof createCheckoutSessionSchema>;

export {
    CreateCheckoutSession,
    createCheckoutSessionSchema,
    SessionMetadata,
    sessionMetadataSchema,
};
