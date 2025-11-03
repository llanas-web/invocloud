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

    override createServerError() {
        return createError({
            statusCode: 500,
            statusMessage: "Infrastructure Error",
            data: {
                code: this.code,
                details: this.details,
            },
        });
    }
}
