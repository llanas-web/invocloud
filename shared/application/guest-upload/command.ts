import { optional, z } from "zod";

export const InitiateGuestUploadSchema = z.object({
    senderEmail: z.email("Email invalide"),
    recipientEmail: z.email("Email invalide"),
});
export type InitiateGuestUploadCommand = z.infer<
    typeof InitiateGuestUploadSchema
>;

export const VerifyGuestUploadSessionSchema = z.object({
    sessionId: z.uuid("ID de session invalide"),
    verificationCode: z.string().length(6, "Le code doit contenir 6 chiffres"),
});
export type VerifyGuestUploadSessionCommand = z.infer<
    typeof VerifyGuestUploadSessionSchema
>;

export const CreateInvoiceFromGuestSessionSchema = z.object({
    sessionId: z.uuid("ID de session invalide"),
    establishmentId: z.uuid("ID d'établissement invalide"),
    fileName: z.string().optional(),
    comment: z.string().optional(),
});

export type CreateInvoiceFromGuestSessionCommand = z.infer<
    typeof CreateInvoiceFromGuestSessionSchema
>;
