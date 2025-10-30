import { BaseError } from "#shared/errors/base.error";

export class ApplicationError extends BaseError {
    constructor(
        message: string,
        details?: unknown,
    ) {
        super(message, "application", "APPLICATION_ERROR", details);
    }

    override createServerError() {
        return createError({
            statusCode: 400,
            statusMessage: "Application Error",
            data: {
                code: this.code,
                details: this.details,
            },
        });
    }

    override createFrontError(): void {
        if (import.meta.server || !import.meta.env.SSR) return;
        useToast().add({
            title: "Une erreur est survenue dans l'application.",
            description: this.message,
            color: "warning",
        });
    }
}
