import type { Response } from 'express';
export declare class UploadController {
    private readonly uploadPath;
    testUploads(): {
        message: string;
        uploadPath: string;
        fileCount: number;
        files: string[];
    };
    serveFile(filename: string, res: Response): Promise<void>;
}
