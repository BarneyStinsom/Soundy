import { Module } from '@nestjs/common';
import { AlbumsController } from './album.controller.js';
import { AlbumsService } from './album.service.js';

@Module({
  controllers: [AlbumsController],
  providers: [AlbumsService]
})
export class AlbumModule {}
