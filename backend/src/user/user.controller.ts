import { Controller, Patch, Delete, Param, Body, Post, Get } from '@nestjs/common';
import { UserService } from './user.service.js';
import { CreateUserDto } from './user.dto.js';

@Controller('users')
export class UserController {
     constructor(private readonly userService: UserService) {}
      @Get()
       findAll() {
         return this.userService.findAll();
     }
      @Get(':id/playlists')
        findPlaylists(@Param('id') id: string) {
          return this.userService.findPlaylists(id);
        }

      @Post('login')
        login(
        @Body('email') email: string,
        @Body('password') password: string) {
        return this.userService.login(email, password);
        }  
     @Post()
        create(
          @Body() user: CreateUserDto
        ) {
          return this.userService.create(
            user.name, 
            user.email, 
            user.password
          );
        }

        @Patch(':id')
        update(
          @Param('id') id: string,
          @Body() user: CreateUserDto
        ) {
          return this.userService.update(
            id, 
            user.name, 
            user.email, 
            user.password);
        }

        @Delete(':id')
        delete(@Param('id') id: string) {
          return this.userService.delete(id);
        }
        
} 
