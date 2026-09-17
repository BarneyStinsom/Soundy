import type { Char } from '@prisma/orm-postgres/target/codec-types';
import { Injectable } from '@nestjs/common';
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
  async create(name: string) {
  return await db.orm.public.Artist.create({
    name,
  });
}
async update(id: string, name: string) {
  return await db.orm.public.Artist
    .where({ id: id as Char<36> })
    .update({
      name,
    });
}
async delete(id: string) {
  return await db.orm.public.Artist
    .where({ id: id as Char<36> })
    .delete();
}
  async findAlbums(id: string) { 
    return await db.orm.public.Album 
     .where({ artistId: id as Char<36> }) 
     .select('id', 'title', 'type') .all(); 
    }
}

