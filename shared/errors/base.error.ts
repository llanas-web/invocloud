// ~/shared/errors/BaseError.ts
export type ErrorKind = "domain" | "infra" | "auth" | "validation" | "app";

export abstract class BaseError extends Error {
    constructor(
        message: string,
        public readonly kind: ErrorKind,
        public readonly code: string, // ex: 'USER_NOT_FOUND', 'DB_TIMEOUT'
        public readonly details?: unknown, // payload structuré (ex: { table, query })
        public override readonly cause?: unknown,
    ) {
        super(message);
        this.name = this.constructor.name;
    }
}
