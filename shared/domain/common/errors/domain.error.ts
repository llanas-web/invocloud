import { BaseError } from "#shared/errors/base.error";

export class DomainError extends BaseError {
    constructor(code: DomainErrorCode, message: string, details?: unknown) {
        super(message, "domain", code, details);
    }

    override createServerError() {
        return createError({
            statusCode: 400,
            statusMessage: `${this.code}: ${this.message}`,
            data: {
                kind: this.kind,
                code: this.code,
                details: this.details,
                message: this.message,
            },
        });
    }

    override createFrontError(): void {
        if (import.meta.server || !import.meta.env.SSR) return;
        console.log(this);
        useToast().add({
            title:
                "Une erreur est survenue lors du traitement de votre demande.",
            description: this.message,
            color: "warning",
        });
    }
}

export enum DomainErrorCode {
    ERROR_UPDATING = "ERROR_UPDATING",
    ENTITY_ALREADY_EXISTS = "ENTITY_ALREADY_EXISTS",
    ENTITY_NOT_FOUND = "ENTITY_NOT_FOUND",
    USER_NOT_FOUND = "USER_NOT_FOUND",
    NO_INVOICE = "NO_INVOICE",
    NO_ESTABLISHMENT = "NO_ESTABLISHMENT",
    BUSINESS_RULE_VIOLATION = "BUSINESS_RULE_VIOLATION",
}
