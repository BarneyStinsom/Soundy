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
  async findOne(id: string) {
  const song = await db.orm.public.Song
    .where({ id: id as Char<36> })
    .select('id', 'title', 'duration', 'songUrl', 'songCoverUrl')
    .include('artist', (artist) => artist.select('id', 'name'))
    .include('album', (album) => album.select('id', 'title', 'type', 'coverUrl'))
    .first();

  if (!song) throw new NotFoundException('Música não encontrada');
  return song;
}
  async create(title: string, duration: number, songUrl: string,
     artistId: string, albumId: string, songCoverUrl?: string) {
  
    const artist = await db.orm.public.Artist
      .where({ id: artistId })
      .first();
    const album = await db.orm.public.Album
      .where({ id: albumId })
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
    artistId: artistId,
    albumId: albumId,
    songCoverUrl,
  });
}

async update(id: string, title: string, duration?: number, songUrl?: string,
   artistId?: string, albumId?: string, songCoverUrl?: string) {
  const song = await db.orm.public.Song
      .where({ id })
      .first();
  
    if (!song) {
      throw new NotFoundException('Música não encontrada');
    }

  const finalArtistId = artistId ?? song.artistId;
  const finalAlbumId = albumId ?? song.albumId;

  if (artistId || albumId) {
    const artist = await db.orm.public.Artist
      .where({ id: finalArtistId })
      .first();
    const album = await db.orm.public.Album
      .where({ id: finalAlbumId })
      .first();
    if (!artist || !album) {
      throw new NotFoundException('Artista ou álbum não encontrado');
    }
    if (album.artistId !== finalArtistId) {
      throw new BadRequestException(
        'O álbum não pertence ao artista informado',
      );
    }
  }

  return await db.orm.public.Song
    .where({ id })
    .update({
      title,
      duration: duration ?? song.duration,
      songUrl: songUrl ?? song.songUrl,
      artistId: finalArtistId,
      albumId: finalAlbumId,
      songCoverUrl: songCoverUrl ?? song.songCoverUrl,
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

async findTopSongs(limitCount = 10) {
  const plan = db.sql.public.PlayHistory
    .select('songId')
    .select('playCount', (f, fns) => (fns as any).count(f.songId))
    .groupBy('songId')
    .orderBy('playCount', { direction: 'desc' })
    .limit(limitCount)
    .build();

  const runtime = db.runtime();
  const counts = await runtime.query(plan);

  const topSongs = [];
  for (const row of counts) {
    const song = await db.orm.public.Song
      .select('id', 'title', 'songCoverUrl')
      .where({ id: row.songId })
      .include('artist', (artist) => artist.select('name'))
      .first();

    topSongs.push({
      songId: row.songId,
      title: song?.title ?? 'Desconhecida',
      songCoverUrl: song?.songCoverUrl ?? null,
      artistName: song?.artist?.name ?? '',
      playCount: row.playCount,
    });
  }

  return topSongs;
}
}