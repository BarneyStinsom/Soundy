import { Injectable } from '@nestjs/common';
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
  async create(title: string, duration: number, artistId: string, albumId: string) {
  return await db.orm.public.Song.create({
    title,
    duration,
    artistId: artistId as Char<36>,
    albumId: albumId as Char<36>,
  });
}

async update(id: string, title: string) {
  return await db.orm.public.Song
    .where({ id: id as Char<36> })
    .update({
      title,
    });
}
async delete(id: string) {
  return await db.orm.public.Song
    .where({ id: id as Char<36> })
    .delete();
}
}