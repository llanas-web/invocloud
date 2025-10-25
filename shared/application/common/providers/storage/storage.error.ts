class StorageError extends Error {
    storageError?: Error;
    constructor(message: string, storageError?: Error) {
        super(message);
        this.name = "StorageError";
        this.storageError = storageError;
    }
}

export default StorageError;
