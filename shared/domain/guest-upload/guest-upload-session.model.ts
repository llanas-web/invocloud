import { PayloadModel } from "../common/payload.model";

export interface GuestUploadResult<T> {
    success: boolean;
    value?: T;
    error?: string;
}

export interface GuestUploadSessionProps {
    id: string;
    senderEmail: string;
    verificationTokenHash: string;
    expiresAt: Date;
    verifiedAt: Date | null;
    createdAt: Date;
}

class GuestUploadSessionModel extends PayloadModel {
    private constructor(private readonly props: GuestUploadSessionProps) {
        super();
    }

    static create(
        senderEmail: string,
        tokenHash: string,
    ): GuestUploadSessionModel {
        return new GuestUploadSessionModel({
            id: crypto.randomUUID(),
            senderEmail,
            verificationTokenHash: tokenHash,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 heure
            verifiedAt: null,
            createdAt: new Date(),
        });
    }

    static fromPersistence(
        props: GuestUploadSessionProps,
    ): GuestUploadSessionModel {
        return new GuestUploadSessionModel(props);
    }

    verify(
        token: string,
        hashFn: (token: string) => string,
    ): GuestUploadResult<GuestUploadSessionModel> {
        if (this.isExpired()) {
            return { success: false, error: "Session expirée" };
        }

        if (this.props.verifiedAt) {
            return { success: false, error: "Session déjà vérifiée" };
        }

        const hashedToken = hashFn(token);
        if (hashedToken !== this.props.verificationTokenHash) {
            return { success: false, error: "Token invalide" };
        }

        const verifiedSession = new GuestUploadSessionModel({
            ...this.props,
            verifiedAt: new Date(),
        });
        return { success: true, value: verifiedSession };
    }

    isVerified(): boolean {
        return this.props.verifiedAt !== null && !this.isExpired();
    }

    isExpired(): boolean {
        return this.props.expiresAt < new Date();
    }

    get id(): string {
        return this.props.id;
    }

    get senderEmail(): string {
        return this.props.senderEmail;
    }

    get verifiedAt(): Date | null {
        return this.props.verifiedAt;
    }

    toPersistence(): GuestUploadSessionProps {
        return { ...this.props };
    }

    override toPayload(): object {
        return {
            id: this.props.id,
            senderEmail: this.props.senderEmail,
            verifiedAt: this.props.verifiedAt,
            expiresAt: this.props.expiresAt,
            createdAt: this.props.createdAt,
        };
    }

    override fromPayload(data: any): this {
        return new GuestUploadSessionModel({
            id: data.id,
            senderEmail: data.senderEmail,
            verificationTokenHash: "",
            expiresAt: new Date(data.expiresAt),
            verifiedAt: data.verifiedAt ? new Date(data.verifiedAt) : null,
            createdAt: new Date(data.createdAt),
        }) as this;
    }
}

export default GuestUploadSessionModel;
