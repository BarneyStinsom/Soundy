import { Injectable } from '@nestjs/common';
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
    
    async create(name: string, userId: string, isPublic: boolean) {
    return await db.orm.public.Playlist.create({
        name,
        userId: userId as Char<36>,
        isPublic,
    });
}
    async update(id: string, name: string) {
        return await db.orm.public.Playlist
        .where({ id: id as Char<36>})
        .update({
            name,
        });
    }

    async delete(id: string) {
        return await db.orm.public.Playlist
        .where({ id: id as Char<36>})
        .delete();
    }
     async findSongs(id: string) {
            return await db.orm.public.PlaylistSong
                .select('id', 'position')
                .where({ playlistId: id as Char<36> })
                .include('playlist', (playlist) =>
                    playlist.select('name')
                )
                .include('song', (song) =>
                 song.select('id', 'title', 'duration')
                 )
                 .all();}
}
