import type { Char } from '@prisma/orm-postgres/target/codec-types';
import { Injectable, NotFoundException  } from '@nestjs/common';
import { db } from '../prisma/db.js';


@Injectable()
export class ArtistsService {
  async findAll() {
    return await db.orm.public.Artist
      .select('id', 'name')
      .all();
  }

  async findOne(id: string) {
    return await db.orm.public.Artist
      .where({ id: id as Char<36> })
      .first();
  }
  async create(name: string, coverUrl?: string) {
  return await db.orm.public.Artist.create({
    name,
    coverUrl,
  });
}
async update(id: string, name: string) {
  const artist = await db.orm.public.Artist
      .where({ id: id as Char<36> })
      .first();
  
    if (!artist) {
      throw new NotFoundException('Artista não encontrado');
    }
  return await db.orm.public.Artist
    .where({ id: id as Char<36> })
    .update({
      name,
    });
}
async delete(id: string) {
  const artist = await db.orm.public.Artist
      .where({ id: id as Char<36> })
      .first();
  
    if (!artist) {
      throw new NotFoundException('Artista não encontrado');
    }
  return await db.orm.public.Artist
    .where({ id: id as Char<36> })
    .delete();
}
  async findAlbums(id: string) { 
    const artist = await db.orm.public.Artist
      .where({ id: id as Char<36> })
      .first();
    if (!artist) {
      throw new NotFoundException('Artista não encontrado');
    }
    const albums = await db.orm.public.Album
      .where({ artistId: id as Char<36> })
      .first();
    if (!albums) {
      throw new NotFoundException('Álbum não encontrado');
    }
    return await db.orm.public.Album 
     .where({ artistId: id as Char<36> }) 
     .select('id', 'title', 'type') .all(); 
    }
}

