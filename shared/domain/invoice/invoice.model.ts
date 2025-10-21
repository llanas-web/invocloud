import { DomainError, DomainErrorCode } from "../common/errors/domain.error";
import { PayloadModel } from "../common/payload.model";

export const InvoiceStatus = {
    OCR: "ocr",
    PENDING: "pending",
    SENT: "sent",
    VALIDATED: "validated",
    PAID: "paid",
    ERROR: "error",
} as const;

export type InvoiceStatus = typeof InvoiceStatus[keyof typeof InvoiceStatus];

export const InvoiceSource = {
    APP: "app",
    UPLOAD: "upload",
    EMAIL: "email",
} as const;

export type InvoiceSource = typeof InvoiceSource[keyof typeof InvoiceSource];

export type InvoiceModelProps = {
    id: string;
    supplierId: string;
    filePath: string;
    status: InvoiceStatus;
    source: InvoiceSource;
    createdAt: Date;
    updatedAt: Date;
} & InvoiceDetailsPatch;

export type InvoiceDetailsPatch = {
    name?: string | null;
    amount?: number | null;
    emitDate?: Date | null;
    dueDate?: Date | null;
    number?: string | null;
    comment?: string | null;
    paidAt?: Date | null;
};

export type DraftInvoice = Omit<
    InvoiceModelProps,
    "id" | "createdAt" | "updatedAt"
>;

export class InvoiceModel extends PayloadModel {
    static override payloadType: string = "InvoiceModel";
    private constructor(readonly props: InvoiceModelProps) {
        super();
        this.props = props;
    }

    static createDraft(
        props: DraftInvoice,
    ): DraftInvoice {
        return { ...props };
    }

    static create(props: InvoiceModelProps): InvoiceModel {
        return new InvoiceModel(props);
    }

    // ─── Core getters ───
    get id() {
        return this.props.id;
    }
    get supplierId() {
        return this.props.supplierId;
    }
    get status() {
        return this.props.status;
    }
    get source() {
        return this.props.source;
    }
    get filePath() {
        return this.props.filePath;
    }
    get createdAt() {
        return this.props.createdAt;
    }
    get updatedAt() {
        return this.props.updatedAt;
    }

    // ─── Optional fields (read-only) ───
    get name() {
        return this.props.name ?? null;
    }
    get emitDate() {
        return this.props.emitDate ?? null;
    }
    get paidAt() {
        return this.props.paidAt ?? null;
    }
    get comment() {
        return this.props.comment ?? null;
    }
    get amount() {
        return this.props.amount ?? null;
    }
    get dueDate() {
        return this.props.dueDate ?? null;
    }
    get number() {
        return this.props.number ?? null;
    }

    get isOverdue(): boolean {
        if (this.props.dueDate) {
            const today = new Date();
            return this.props.dueDate < today &&
                this.props.status !== InvoiceStatus.PAID;
        }
        return false;
    }

    changeStatus(
        newStatus: InvoiceStatus,
        optional?: { paidAt?: Date | null },
    ): InvoiceModel {
        if (
            newStatus === InvoiceStatus.PAID && !optional?.paidAt &&
            !this.props.paidAt
        ) {
            return new InvoiceModel({
                ...this.props,
                status: newStatus,
                paidAt: new Date(),
                updatedAt: new Date(),
            });
        }
        if (newStatus !== InvoiceStatus.PAID && optional?.paidAt) {
            throw new DomainError(
                DomainErrorCode.ERROR_UPDATING,
                "Le status ne peut pas être modifié en dehors de 'PAID' si une date de paiement est fournie.",
            );
        }
        return new InvoiceModel({
            ...this.props,
            status: newStatus,
            paidAt: newStatus === InvoiceStatus.PAID
                ? (optional?.paidAt ?? this.props.paidAt ?? new Date())
                : this.props.paidAt,
            updatedAt: new Date(),
        });
    }

    withDetails(patch: InvoiceDetailsPatch): InvoiceModel {
        if (patch.amount != null && patch.amount! < 0) {
            throw new DomainError(
                DomainErrorCode.ERROR_UPDATING,
                "Le montant de la facture ne peut pas être négatif.",
            );
        }
        return new InvoiceModel({
            ...this.props,
            name: patch.name ?? this.props.name ?? null,
            amount: patch.amount ?? this.props.amount ?? null,
            emitDate: patch.emitDate ?? this.props.emitDate ?? null,
            dueDate: patch.dueDate ?? this.props.dueDate ?? null,
            number: patch.number ?? this.props.number ?? null,
            comment: patch.comment ?? this.props.comment ?? null,
            paidAt: patch.paidAt ?? this.props.paidAt ?? null,
            updatedAt: new Date(),
        });
    }

    override toPayload(): object {
        return {
            id: this.id,
            supplierId: this.supplierId,
            status: this.status,
            source: this.source,
            filePath: this.filePath,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            name: this.name,
            emitDate: this.emitDate,
            paidAt: this.paidAt,
            comment: this.comment,
            amount: this.amount,
            dueDate: this.dueDate,
            number: this.number,
        };
    }

    static fromPayload(data: any): InvoiceModel {
        return InvoiceModel.create({
            id: data.id,
            supplierId: data.supplierId,
            status: data.status,
            source: data.source,
            filePath: data.filePath,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt),
            name: data.name ?? null,
            emitDate: data.emitDate ? new Date(data.emitDate) : null,
            paidAt: data.paidAt ? new Date(data.paidAt) : null,
            comment: data.comment ?? null,
            amount: data.amount ?? null,
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
            number: data.number ?? null,
        });
    }

    override fromPayload(data: any): this {
        return InvoiceModel.fromPayload(data) as this;
    }
}
