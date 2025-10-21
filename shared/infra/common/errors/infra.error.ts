import { BaseError } from "#shared/errors/base.error";

export class InfraError extends BaseError {
    constructor(
        code: string,
        message: string,
        details?: unknown,
        cause?: unknown,
    ) {
        super(message, "infra", code, details, cause);
    }
}
