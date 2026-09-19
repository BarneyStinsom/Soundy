import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../prisma/db.js';
import type { Char } from '@prisma/orm-postgres/target/codec-types';
@Injectable()
export class UserService {
    async findAll(){
        return await db.orm.public.User
        .select('id', 'name', 'email')
        .all();
    }

    async findPlaylists(id: string){
        const user = await db.orm.public.User
        .where({ id: id as Char<36> })
        .first();
        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }
        return await db.orm.public.Playlist
        .where({ userId: id as Char<36> })
        .select('id', 'name')
        .all();
    }

    async create(name: string, email: string, password: string){
        return await db.orm.public.User.create({
            name,
            email,
            password,
        });
    }
    async update(id: string, name: string, email: string, password: string){
        const user = await db.orm.public.User
        .where({ id: id as Char<36> })
        .first();
        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }
        return await db.orm.public.User
        .where({ id: id as Char<36>})
        .update({
            name,
            email,
            password,
        });
    }
    
    async delete(id: string){
        const user = await db.orm.public.User
        .where({ id: id as Char<36> })
        .first();
        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }
        return await db.orm.public.User
        .where({ id: id as Char<36>})
        .delete();
    }
    
async login(email: string, password: string) {
  const user = await db.orm.public.User
    .where({ email })
    .first();

  if (!user || user.password !== password) {
    throw new NotFoundException('Email ou senha incorretos');
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

}
