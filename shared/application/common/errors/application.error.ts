import { BaseError } from "#shared/errors/base.error";

export class ApplicationError extends BaseError {
    constructor(
        message: string,
        details?: unknown,
    ) {
        super(message, "application", "APPLICATION_ERROR", details);
    }
}
