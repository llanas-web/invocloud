import { BaseError } from "./base.error";
export class DomainError extends BaseError {
    constructor(code: DomainErrorCode, message: string, details?: unknown) {
        super(message, "domain", code, details);
    }
}

export enum DomainErrorCode {
    UESR_NOT_FOUND = "USER_NOT_FOUND",
    NO_INVOICE = "NO_INVOICE",
    NO_ESTABLISHMENT = "NO_ESTABLISHMENT",
}
