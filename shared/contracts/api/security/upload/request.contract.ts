import { z } from "zod";

export const RequestUploadInvoiceRequestSchema = z.object({
    senderEmail: z.email(),
    recipientEmail: z.email(),
});

export const RequestUploadInvoiceResponseSchema = z.uuid();

export type RequestUploadInvoiceBody = z.infer<
    typeof RequestUploadInvoiceRequestSchema
>;
export type RequestUploadInvoiceResponse = z.infer<
    typeof RequestUploadInvoiceResponseSchema
>;
