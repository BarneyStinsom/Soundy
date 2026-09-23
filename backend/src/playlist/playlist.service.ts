import { Injectable, NotFoundException } from '@nestjs/common';
import type { Char } from '@prisma/orm-postgres/target/codec-types';
import { db } from '../prisma/db.js';

@Injectable()
export class PlaylistService {
    async findAll() {
        return await db.orm.public.Playlist
        .select('id', 'name', 'isPublic')
        .include('user', (user) =>
            user.select('name')
        )
        .all();
    }
    async findSongs(id: string) {

                const playlist = await db.orm.public.Playlist
      .where({ id: id as Char<36> })
      .first(); 
                const song = await db.orm.public.PlaylistSong
                .where({ playlistId: id as Char<36> })
                .first();
  
    if (!playlist) {
      throw new NotFoundException('Playlist não encontrada');
    }
    if  (!song) {
      throw new NotFoundException('Nenhuma música encontrada para esta playlist');
    }
            return await db.orm.public.PlaylistSong
                .select('id', 'position')
                .where({ playlistId: id as Char<36> })
                .include('playlist', (playlist) =>
                    playlist.select('name')
                )
                .include('song', (song) =>
                 song.select('id', 'title', 'duration', 'songCoverUrl')
                 )
                 .all();
    }

    async create(name: string, userId: string, isPublic: boolean, coverUrl?: string) {

         const user = await db.orm.public.User
            .where({ id: userId as Char<36> })
            .first();
        
          if (!user) {
            throw new NotFoundException('Usuário não encontrado');
          }
        
    return await db.orm.public.Playlist.create({
        name,
        userId,
        coverUrl,
        isPublic,
    });
}
    async update(id: string, name: string) {
        const playlist = await db.orm.public.Playlist
      .where({ id })
      .first();
  
    if (!playlist) {
      throw new NotFoundException('Playlist não encontrada');
    }
        return await db.orm.public.Playlist
        .where({ id })
        .update({
            name,
        });
    }

    async delete(id: string) {
        const playlist = await db.orm.public.Playlist
      .where({ id })
      .first();
  
    if (!playlist) {
      throw new NotFoundException('Playlist não encontrada');
    }
        return await db.orm.public.Playlist
        .where({ id })
        .delete();
    }
     
}