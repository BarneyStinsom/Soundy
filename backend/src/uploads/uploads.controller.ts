import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Credenciais vêm de variáveis de ambiente — configure no .env local
// e nas env vars do Render (nunca coloque isso direto no código).
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_AUDIO_MIME = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg'];
const ALLOWED_IMAGE_MIME = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

// Cada tipo tem sua própria storage porque o Cloudinary trata áudio
// como resource_type "video" e imagem como "image".
const audioStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'soundy/audio',
    resource_type: 'video',
    allowed_formats: ['mp3', 'wav', 'ogg'],
  } as any,
});

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'soundy/images',
    resource_type: 'image',
    allowed_formats: ['png', 'jpg', 'jpeg', 'webp', 'gif'],
  } as any,
});

@Controller('uploads')
export class UploadsController {
  @Post('audio')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: audioStorage,
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
    // com CloudinaryStorage, o multer preenche file.path com a URL pública já hospedada
    return { url: file.path };
  }

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: imageStorage,
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
    return { url: file.path };
  }
}