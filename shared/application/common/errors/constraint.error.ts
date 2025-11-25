import { BaseError } from "#shared/errors/base.error";

export class ConstraintError extends BaseError {
    constructor(
        message: string,
        details?: unknown,
    ) {
        super(message, "application", "CONSTRAINT_ERROR", details);
    }

    override createServerError() {
        return createError({
            statusCode: 403,
            statusMessage: "Constraint Error",
            data: {
                kind: this.kind,
                code: this.code,
                details: this.details,
                message: this.message,
            },
        });
    }
}
