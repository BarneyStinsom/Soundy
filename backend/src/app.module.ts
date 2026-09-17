import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ArtistsModule } from './artists/artists.module.js';
import { SongsModule } from './songs/songs.module.js';
import { PlaylistModule } from './playlist/playlist.module.js';
import { UserModule } from './user/user.module.js';
import { PlaylistsongsModule } from './playlistsongs/playlistsongs.module.js';
import { AlbumModule } from './album/album.module.js';
import { PlayHistoryModule } from './playhistory/playhistory.module.js';

@Module({
  imports: [ArtistsModule, SongsModule, PlaylistModule, UserModule, PlaylistsongsModule, AlbumModule, PlayHistoryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
