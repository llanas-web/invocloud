import { BaseError } from "./base.error";
export class DomainError extends BaseError {
    constructor(code: string, message: string, details?: unknown) {
        super(message, "domain", code, details);
    }
}
