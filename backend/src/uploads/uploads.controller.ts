import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';

// Salva dentro de public/uploads, que já é servido como estático pelo ServeStaticModule
// (ver app.module.ts), então o arquivo fica acessível em /uploads/<nome>.
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const uploadsDir = join(__dirname, '..', '..', 'public', 'uploads');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

const ALLOWED_AUDIO_MIME = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg'];
const ALLOWED_IMAGE_MIME = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

function uniqueFilename(originalname: string) {
  return `${randomUUID()}${extname(originalname).toLowerCase()}`;
}

@Controller('uploads')
export class UploadsController {
  @Post('audio')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadsDir,
        filename: (_req, file, cb) => cb(null, uniqueFilename(file.originalname)),
      }),
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_AUDIO_MIME.includes(file.mimetype)) {
          return cb(
            new BadRequestException('Envie um arquivo de áudio válido (mp3, wav ou ogg).'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  uploadAudio(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }
    return { url: `/uploads/${file.filename}` };
  }

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadsDir,
        filename: (_req, file, cb) => cb(null, uniqueFilename(file.originalname)),
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_IMAGE_MIME.includes(file.mimetype)) {
          return cb(
            new BadRequestException('Envie uma imagem válida (png, jpg, webp ou gif).'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }
    return { url: `/uploads/${file.filename}` };
  }
}
