import { z } from "zod";

export const ValidateUploadInvoiceRequestSchema = z.object({
    uploadValidationId: z.uuid(),
    token: z.string().min(6).max(6),
});

export const ValidateUploadInvoiceResponseSchema = z.object({
    establishments: z.array(z.uuid()),
});

export type ValidateUploadInvoiceBody = z.infer<
    typeof ValidateUploadInvoiceRequestSchema
>;
export type ValidateUploadInvoiceResponse = z.infer<
    typeof ValidateUploadInvoiceResponseSchema
>;
