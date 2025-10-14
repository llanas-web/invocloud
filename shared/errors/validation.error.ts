import { BaseError } from "./base.error";
export class ValidationError extends BaseError {
    constructor(details: unknown) {
        super("Invalid request", "validation", "VALIDATION_FAILED", details);
    }
}
