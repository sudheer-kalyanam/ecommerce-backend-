import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller('uploads')
export class UploadController {
  private readonly uploadPath = path.join(process.cwd(), 'uploads');

  @Get('test')
  testUploads() {
    const files = fs.readdirSync(this.uploadPath);
    return {
      message: 'Upload directory accessible',
      uploadPath: this.uploadPath,
      fileCount: files.length,
      files: files.slice(0, 5) // Show first 5 files
    };
  }

  @Get(':filename')
  async serveFile(@Param('filename') filename: string, @Res() res: Response) {
    try {
      // Security check - prevent directory traversal
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        throw new NotFoundException(`Invalid filename`);
      }

      const filePath = path.join(this.uploadPath, filename);
      
      if (!fs.existsSync(filePath)) {
        throw new NotFoundException(`File ${filename} not found`);
      }

      // Set appropriate headers for PDF files
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.on('error', () => {
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error reading file' });
        }
      });
      
      fileStream.pipe(res);
    } catch (error) {
      if (!res.headersSent) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new NotFoundException(`File ${filename} not found`);
      }
    }
  }
}
