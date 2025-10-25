import { z } from "zod";

export const SendInvoiceUploadSchema = z.object({
    establishmentId: z.uuid(),
    supplierId: z.uuid(),
    fileName: z.string().min(1).max(255),
    comment: z.string().min(1),
});
export type SendInvoiceUpload = z.infer<typeof SendInvoiceUploadSchema>;
