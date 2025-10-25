import type GuestUploadSessionModel from "./guest-upload-session.model";

export interface GuestUploadSessionRepository {
    save(session: GuestUploadSessionModel): Promise<void>;
    findById(id: string): Promise<GuestUploadSessionModel | null>;
    delete(id: string): Promise<void>;
}
