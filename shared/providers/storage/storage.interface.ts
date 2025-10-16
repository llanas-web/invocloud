export interface StorageProvider {
    uploadFile(
        bucket: string,
        path: string,
        file: File,
        options: { contentType: string; upsert: boolean },
    ): Promise<string>;
    deleteFile(bucket: string, filePath: string): Promise<void>;
    downloadFile(bucket: string, filePath: string): Promise<Blob>;
    createSignedUploadUrl(bucket: string, filePath: string): Promise<string>;
    createSignedUrl(
        bucket: string,
        filePath: string,
        expiresIn: number,
    ): Promise<string>;
}
