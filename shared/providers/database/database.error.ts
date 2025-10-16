class DatabaseError extends Error {
    postgresError?: Error;
    constructor(message: string, postgresError?: Error) {
        super(message);
        this.name = "DatabaseError";
        this.postgresError = postgresError;
    }
}

export default DatabaseError;
