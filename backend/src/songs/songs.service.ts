import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import type { Char } from '@prisma/orm-postgres/target/codec-types';
import { db } from '../prisma/db.js';

@Injectable()
export class SongsService {
 async findAll() {
  return await db.orm.public.Song
    .select('id', 'title', 'duration')
    .include('artist', (artist) =>
      artist.select('name')
    )
    .all();
}
  async create(title: string, duration: number, songUrl: string,
     artistId: string, albumId: string) {
  
    const artist = await db.orm.public.Artist
      .where({ id: artistId as Char<36> })
      .first();
    const album = await db.orm.public.Album
      .where({ id: albumId as Char<36> })
      .first();
    if (!artist || !album) {
      throw new NotFoundException('Artista ou álbum não encontrado');
    }
    if (album.artistId !== artistId) {
  throw new BadRequestException(
    'O álbum não pertence ao artista informado',
    );
   }
    return await db.orm.public.Song.create({
    title,
    duration,
    songUrl,
    artistId: artistId as Char<36>,
    albumId: albumId as Char<36>,
  });
}

async update(id: string, title: string) {
  const song = await db.orm.public.Song
      .where({ id: id as Char<36> })
      .first();
  
    if (!song) {
      throw new NotFoundException('Música não encontrada');
    }
  return await db.orm.public.Song
    .where({ id: id as Char<36> })
    .update({
      title,
    });
}
async delete(id: string) {
  const song = await db.orm.public.Song
      .where({ id: id as Char<36> })
      .first();
  
    if (!song) {
      throw new NotFoundException('Música não encontrada');
    }
  return await db.orm.public.Song
    .where({ id: id as Char<36> })
    .delete();
}
}