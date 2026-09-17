import { Module } from '@nestjs/common';
import { PlaylistsongsController } from './playlistsongs.controller.js';
import { PlaylistsongsService } from './playlistsongs.service.js';

@Module({
  controllers: [PlaylistsongsController],
  providers: [PlaylistsongsService]
})
export class PlaylistsongsModule {}
