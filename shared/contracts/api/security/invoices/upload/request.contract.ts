import { z } from "zod";

export const RequestInvoiceUploadSchema = z.object({
    senderEmail: z.email(),
    recipientEmail: z.email(),
});
export type RequestInvoiceUpload = z.infer<typeof RequestInvoiceUploadSchema>;
