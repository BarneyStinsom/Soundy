import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ArtistsModule } from './artists/artists.module.js';
import { SongsModule } from './songs/songs.module.js';
import { PlaylistModule } from './playlist/playlist.module.js';
import { UserModule } from './user/user.module.js';
import { PlaylistsongsModule } from './playlistsongs/playlistsongs.module.js';
import { AlbumModule } from './album/album.module.js';
import { PlayHistoryModule } from './playhistory/playhistory.module.js';
import { UploadsModule } from './uploads/uploads.module.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),
    ArtistsModule, SongsModule, PlaylistModule, UserModule, PlaylistsongsModule, AlbumModule, PlayHistoryModule, UploadsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}