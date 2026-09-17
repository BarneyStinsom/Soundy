import { Injectable, NotFoundException } from '@nestjs/common';
import type { Char } from '@prisma/orm-postgres/target/codec-types';
import { db } from '../prisma/db.js';

@Injectable()
export class AlbumsService {

  async findAll() {
    return await db.orm.public.Album
      .select('id', 'title', 'type', 'artistId')
      .include('artist', (artist) =>
        artist.select('name')
      )
      .all();
  }

  async findOne(id: string) {
    return await db.orm.public.Album
      .where({ id: id as Char<36> })
      .select('id', 'title', 'type', 'artistId')
      .include('artist', (artist) =>
        artist.select('name')
      )
      .first();
  }

  async create(title: string, type: string, artistId: string) {

  const artist = await db.orm.public.Artist
    .where({ id: artistId as Char<36> })
    .first();

  if (!artist) {
    throw new NotFoundException('Artista não encontrado');
  }

  return await db.orm.public.Album.create({
    title,
    type,
    artistId: artistId as Char<36>,
  });
}



  async update(id: string, title: string, type: string) {
    const album = await db.orm.public.Album
  .where({ id: id as Char<36> })
  .first();

    if (!album) {
       throw new NotFoundException('Álbum não encontrado');
}
    return await db.orm.public.Album
      .where({ id: id as Char<36> })
      .update({
        title,
        type,
      });
  }

  async delete(id: string) {
    return await db.orm.public.Album
      .where({ id: id as Char<36> })
      .delete();
  }
  async findSongs(id: string) { 
    return await db.orm.public.Song 
     .where({ albumId: id as Char<36> }) 
     .select('id', 'title', 'duration') .all(); }
}

