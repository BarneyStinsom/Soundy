import { Injectable } from '@nestjs/common';
import { db } from '../prisma/db.js';
import type { Char } from '@prisma/orm-postgres/target/codec-types';
@Injectable()
export class UserService {
    async findAll(){
        return await db.orm.public.User
        .select('id', 'name', 'email')
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
        return await db.orm.public.User
        .where({ id: id as Char<36>})
        .update({
            name,
            email,
            password,
        });
    }
    
    async delete(id: string){
        return await db.orm.public.User
        .where({ id: id as Char<36>})
        .delete();
    }

}
