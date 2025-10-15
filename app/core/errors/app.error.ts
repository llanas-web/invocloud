import { BaseError } from "#shared/errors/base.error";
export class AppError extends BaseError {
    constructor(code: string, message: string, details?: unknown) {
        super(message, "app", code, details);
    }
}
