import { BaseError } from "./base.error";
export class AuthError extends BaseError {
    constructor(code: string, message: string, details?: unknown) {
        super(message, "auth", code, details);
    }
}
