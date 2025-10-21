import { BaseError } from "#shared/errors/base.error";

export class ApplicationError extends BaseError {
    constructor(
        code: string,
        message: string,
        details?: unknown,
    ) {
        super(message, "application", code, details);
    }
}
