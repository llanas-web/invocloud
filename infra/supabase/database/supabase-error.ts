import { InfraError } from "#shared/errors/infra.error";

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
}
