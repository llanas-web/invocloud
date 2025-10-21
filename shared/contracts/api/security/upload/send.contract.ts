import { z } from "zod";

export const SendUploadInvoiceRequestSchema = z.object({
    uploadValidationId: z.uuid(),
    selectedEstablishmentId: z.uuid(),
    comment: z.string().optional(),
    fileName: z.string().optional(),
});

export const SendUploadInvoiceResponseSchema = z.url();

export type SendUploadInvoiceBody = z.infer<
    typeof SendUploadInvoiceRequestSchema
>;
export type SendUploadInvoiceResponse = z.infer<
    typeof SendUploadInvoiceResponseSchema
>;
