import { HTTPStatus } from "./status";

class ServerError extends Error {
    constructor(public status: HTTPStatus, message: string) {
        super(message);
        this.name = "ServerError";
    }
}

export default ServerError;
