import type { NuxtError } from "#app";
import { BaseError } from "#shared/errors/base.error";
import { FetchError } from "ofetch";

export class AppError extends Error {
    constructor(
        public readonly title: string,
        message?: string,
        public readonly isError: boolean = true,
        public readonly details?: unknown,
    ) {
        super(message ?? title);
    }

    static fromFetchError(err: FetchError): AppError {
        if (err.data?.data?.kind) {
            return AppError.fromBaseError(
                err.data.data as unknown as BaseError,
            );
        }
        return new AppError(err.statusMessage ?? err.message, err.data);
    }

    static fromBaseError(err: BaseError): AppError {
        switch (err.kind) {
            case "auth":
                return new AppError(
                    "Erreur d'authentification",
                    err.message,
                    false,
                );
            case "domain":
                return new AppError("Erreur métier", err.message, false);
            case "application":
                return new AppError(
                    "Erreur application",
                    err.message,
                    false,
                );
            case "infra":
                return new AppError(
                    "Erreur infrastructure",
                    err.message,
                    false,
                );
            case "server":
                return new AppError("Erreur serveur", err.message, true);
            default:
                return new AppError("Erreur inconnue", err.message, true);
        }
    }
}
