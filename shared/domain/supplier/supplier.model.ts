import type { ModelCommonUpdateProps } from "../common/common.interface";
import { DomainError, DomainErrorCode } from "../common/errors/domain.error";
import { PayloadModel } from "../common/payload.model";

export type SupplierModelProps =
    & ModelCommonUpdateProps
    & SupplierRequiredProps
    & SupplierMutableProps;

export type SupplierRequiredProps = {
    name: string;
    emails: string[];
    establishmentId: string;
};

export type SupplierMutableProps = {
    phone?: string | null;
};

export type DraftSupplier = Omit<
    SupplierModelProps,
    "id" | "createdAt" | "updatedAt"
>;

export class SupplierModel extends PayloadModel {
    static override payloadType: string = "SupplierModel";

    private constructor(readonly props: SupplierModelProps) {
        super();
        this.props = props;
    }

    static create(props: SupplierModelProps): SupplierModel {
        return new SupplierModel(props);
    }

    // ─── Core getters ───
    get id() {
        return this.props.id;
    }
    get createdAt() {
        return this.props.createdAt;
    }
    get updatedAt() {
        return this.props.updatedAt;
    }

    // ─── Required fields ───
    get establishmentId() {
        return this.props.establishmentId;
    }
    get name() {
        return this.props.name;
    }
    get emails() {
        return this.props.emails;
    }

    // ─── Optional fields ───
    get phone() {
        return this.props.phone ?? null;
    }

    hasEmail(email: string): boolean {
        return this.props.emails.includes(email);
    }

    addEmail(email: string): SupplierModel {
        if (this.hasEmail(email)) {
            throw new DomainError(
                DomainErrorCode.ENTITY_ALREADY_EXISTS,
                `L'utilisateur ${email} est déjà fournisseur de cet établissement`,
            );
        }
        const updatedEmails = [...this.props.emails, email];
        return new SupplierModel({
            ...this.props,
            emails: updatedEmails,
        });
    }

    removeEmail(email: string): SupplierModel {
        if (!this.hasEmail(email)) {
            throw new DomainError(
                DomainErrorCode.ENTITY_NOT_FOUND,
                `L'utilisateur ${email} n'est pas fournisseur de cet établissement`,
            );
        }
        const updatedEmails = this.props.emails.filter((e) => e !== email);
        return new SupplierModel({
            ...this.props,
            emails: updatedEmails,
        });
    }

    withDetails(
        updates: Partial<SupplierMutableProps & SupplierRequiredProps>,
    ): SupplierModel {
        return new SupplierModel({
            ...this.props,
            ...updates,
        });
    }

    override toPayload(): Record<string, any> {
        return {
            id: this.props.id,
            createdAt: this.props.createdAt,
            updatedAt: this.props.updatedAt,
            name: this.props.name,
            emails: this.props.emails,
            establishmentId: this.props.establishmentId,
            phone: this.props.phone,
        };
    }

    override fromPayload(data: any): this {
        throw new Error("Method not implemented.");
    }
}
