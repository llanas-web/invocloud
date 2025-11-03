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
}

export default ServerError;
