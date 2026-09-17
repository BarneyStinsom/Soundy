import { Injectable, NotFoundException   } from '@nestjs/common';
import type { Char } from '@prisma/orm-postgres/target/codec-types';
import { db } from '../prisma/db.js';

@Injectable()
export class PlaylistsongsService {
    async findAll() {
        return await db.orm.public.PlaylistSong
            .select('id', 'position')
            .include('playlist', (playlist) =>
                playlist.select('name')
            )
            .include('song', (song) =>
                song.select('title')
            )
            .all();
    }
    async create(playlistId: string, songId: string, position: number) {
         const song = await db.orm.public.Song
            .where({ id: songId as Char<36> })
            .first();
        
         const playlist = await db.orm.public.Playlist
            .where({ id: playlistId as Char<36> })
            .first();

          if (!song || !playlist) {
            throw new NotFoundException('Música ou playlist não encontrada');
          }
        
        return await db.orm.public.PlaylistSong.create({
            playlistId: playlistId as Char<36>,
            songId: songId as Char<36>,
            position: position,
        });
    }
    async update(id: string, position: number) {
        const playlistSong = await db.orm.public.PlaylistSong
              .where({ id: id as Char<36> })
              .first();
          
            if (!playlistSong) {
              throw new NotFoundException('Música da playlist não encontrada');
            }
        return await db.orm.public.PlaylistSong
            .where({ id: id as Char<36> })
            .update({
                position,
            });
    }
    async delete(id: string) {
         const playlistSong = await db.orm.public.PlaylistSong
              .where({ id: id as Char<36> })
              .first();
          
            if (!playlistSong) {
              throw new NotFoundException('Música da playlist não encontrada');
            }
        return await db.orm.public.PlaylistSong
            .where({ id: id as Char<36> })
            .delete();
    }
   
}
