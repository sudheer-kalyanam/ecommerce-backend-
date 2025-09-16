import multer from 'multer';
export declare class UploadService {
    private readonly uploadPath;
    private readonly maxFileSize;
    constructor();
    getMulterConfig(): multer.Options;
    validateFileSize(file: Express.Multer.File): void;
    getFileUrl(filename: string): string;
    deleteFile(filename: string): void;
}
