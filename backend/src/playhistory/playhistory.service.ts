import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../prisma/db.js';
import { stringify } from 'querystring';

@Injectable()
export class PlayHistoryService {
    async findAll() {
        const playHistory = await db.orm.public.PlayHistory
            .select('id', 'userId', 'songId', 'playedAt')
            .include('user', (user) =>
                user.select('name')
            )
            .include('song', (song) =>
                song.select('title')
            )
            .all();
        return playHistory;
        
    }
    async create(userId: string, songId: string, playedAt: string) {
        const user = await db.orm.public.User
            .where({ id: userId })
            .first();
        const song = await db.orm.public.Song
            .where({ id: songId })
            .first();

        if (!user || !song) {
            throw new NotFoundException('Usuário ou música não encontrados');
        }

        return await db.orm.public.PlayHistory.create({
            userId,
            songId,
            playedAt,
        });
    }

    async delete(id: string) {
        const playHistory = await db.orm.public.PlayHistory
            .where({ id })
            .first();

        if (!playHistory) {
            throw new NotFoundException('Histórico de reprodução não encontrado');
        }

        return await db.orm.public.PlayHistory
            .where({ id })
            .delete();
    }
}
