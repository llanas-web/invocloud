import { BaseError } from "~~/shared/errors/base.error";
import { ConstraintError } from "~~/shared/application/common/errors/constraint.error";

export const handleError = (error: unknown) => {
    if (error instanceof ConstraintError) {
        console.error("Constraint error occurred:", error.message);
        return error.createServerError();
    }
    if (error instanceof BaseError) {
        console.error("Handled error kind: ", error.kind);
        console.error("Handled error code: ", error.code);
        console.error("Handled error message: ", error.message);
        return error.createServerError();
    } else if (error instanceof Error) {
        console.error("Unhandled error:", error);
        console.error("Unhandled error message: ", error.message);
        return createError({
            statusCode: 500,
            statusMessage: "Internal Server Error",
            data: { detail: error.message },
        });
    } else {
        console.error("Unknown error:", error);
        return createError({
            statusCode: 500,
            statusMessage: "Internal Server Error",
            data: { detail: "An unknown error occurred." },
        });
    }
};
