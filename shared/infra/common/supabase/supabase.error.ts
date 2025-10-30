import { InfraError } from "../infra.error";

export class SupabaseError extends InfraError {
    constructor(
        code: string,
        message: string,
        details?: unknown,
        cause?: unknown,
    ) {
        super(code, message, details, cause);
    }

    static fromPostgrest(
        err: { code?: string; message?: string; details?: any },
    ) {
        return new SupabaseError(
            err.code ?? "POSTGREST_ERROR",
            err.message ?? "Supabase query failed",
            err.details,
            err,
        );
    }

    override createServerError() {
        return createError({
            statusCode: 500,
            statusMessage: "Supabase Error",
            data: {
                code: this.code,
                details: this.details,
            },
        });
    }

    override createFrontError(): void {
        if (import.meta.server || !import.meta.env.SSR) return;
        useToast().add({
            title:
                "Une erreur est survenue lors de la communication avec Supabase.",
            description: this.message,
            color: "error",
        });
    }
}
