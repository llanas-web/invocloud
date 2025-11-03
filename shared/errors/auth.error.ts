import type { NuxtError } from "#app";
import { BaseError } from "./base.error";
export class AuthError extends BaseError {
    constructor(code: string, message: string, details?: unknown) {
        super(message, "auth", code, details);
    }

    override createServerError(): NuxtError {
        return createError({
            statusCode: 401,
            statusMessage: "Authentication Error",
            data: {
                code: this.code,
                details: this.details,
            },
        });
    }
}
