import type { ModelCommonUpdateProps } from "~~/shared/domain/common/common.interface";
import { PayloadModel } from "~~/shared/domain/common/payload.model";

export const InvoiceTaskStatus = {
    QUEUED: "queued",
    SUBMITTED: "submitted",
    DONE: "done",
    ERROR: "error",
} as const;

export type InvoiceTaskStatus =
    typeof InvoiceTaskStatus[keyof typeof InvoiceTaskStatus];

export const InvoiceTaskType = {
    OCR: "ocr",
    PDP_VALIDATION: "pdp_validation",
} as const;

export type InvoiceTaskType =
    typeof InvoiceTaskType[keyof typeof InvoiceTaskType];

export const OcrProviderName = {
    MINDEE: "mindee",
} as const;

export type OcrProviderName =
    typeof OcrProviderName[keyof typeof OcrProviderName];

export type InvoiceTaskModelProps =
    & ModelCommonUpdateProps
    & InvoiceTaskRequiredProps
    & InvoiceTaskMutableProps;

export type InvoiceTaskRequiredProps = {
    invoiceId: string;
    type: InvoiceTaskType;
    status: InvoiceTaskStatus;
};

export type InvoiceTaskMutableProps = {
    jobId?: string | null;
    provider?: OcrProviderName;
    attempts?: number;
    rawResult?: string | null;
};

export type InvoiceTaskDraft = Omit<
    InvoiceTaskModelProps,
    "id" | "createdAt" | "updatedAt"
>;

export class InvoiceTaskModel extends PayloadModel {
    constructor(public readonly props: InvoiceTaskModelProps) {
        super();
    }

    get invoiceId(): string {
        return this.props.invoiceId;
    }

    get type(): InvoiceTaskType {
        return this.props.type;
    }

    get status(): InvoiceTaskStatus {
        return this.props.status;
    }

    get jobId(): string | null {
        return this.props.jobId ?? null;
    }

    get provider(): OcrProviderName | undefined {
        return this.props.provider;
    }

    get attempts(): number {
        return this.props.attempts ?? 0;
    }

    get rawResult(): string | null {
        return this.props.rawResult ?? null;
    }

    public static createOcrTask(data: {
        invoiceId: string;
        provider: OcrProviderName;
    }): InvoiceTaskDraft {
        return new InvoiceTaskModel({
            invoiceId: data.invoiceId,
            type: InvoiceTaskType.OCR,
            status: InvoiceTaskStatus.QUEUED,
            provider: data.provider,
            attempts: 0,
            jobId: null,
            rawResult: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    public submit(jobId: string): void {
        if (this.props.status !== InvoiceTaskStatus.QUEUED) {
            throw new DomainError(
                DomainErrorCode.BUSINESS_RULE_VIOLATION,
                "Cannot submit a task that is not queued",
            );
        }

        this.props.status = InvoiceTaskStatus.SUBMITTED;
        this.props.jobId = jobId;
        this.props.attempts = (this.props.attempts ?? 0) + 1;
        this.props.updatedAt = new Date();
    }

    public markAsDone(rawResult?: string): void {
        if (this.props.status !== InvoiceTaskStatus.SUBMITTED) {
            throw new DomainError(
                DomainErrorCode.BUSINESS_RULE_VIOLATION,
                "Cannot mark as done a task that is not submitted",
            );
        }

        this.props.status = InvoiceTaskStatus.DONE;
        this.props.rawResult = rawResult ?? null;
        this.props.updatedAt = new Date();
    }

    public markAsError(): void {
        this.props.status = InvoiceTaskStatus.ERROR;
        this.props.updatedAt = new Date();
    }

    public canRetry(maxAttempts: number = 5): boolean {
        return this.attempts < maxAttempts &&
            this.props.status !== InvoiceTaskStatus.DONE;
    }
}
