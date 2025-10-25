export interface GuestUploadSessionDTO {
    id: string;
    senderEmail: string;
    expiresAt: Date;
    verified: boolean;
}