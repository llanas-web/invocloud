import { BaseError } from "#shared/errors/base.error";
export class AppError extends BaseError {
    constructor(message: string, details?: unknown) {
        super(message, "app", "APP_ERROR", details);
    }
}
