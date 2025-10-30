import { BaseError } from "~~/shared/errors/base.error";
import { HTTPStatus } from "./status";

class ServerError extends BaseError {
    constructor(public status: HTTPStatus, message: string) {
        super(message, "server", "SERVER_ERROR");
    }

    override createServerError() {
        return createError({
            statusCode: this.status,
            statusMessage: this.message,
        });
    }

    override createFrontError(): void {
        throw new Error("Method not implemented.");
    }
}

export default ServerError;
