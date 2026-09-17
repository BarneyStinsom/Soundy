import { Controller, Body, Post, Get, Patch, Delete, Param } from '@nestjs/common';
import { PlaylistService } from './playlist.service.js';
import { CreatePlaylistDto } from './playlist.dto.js';

@Controller('playlists')
export class PlaylistController {
    constructor(private readonly playlistService: PlaylistService) {}
    @Get()
    findAll() {
        return this.playlistService.findAll();
    }

    @Get(':id/songs')
    findSongs(@Param('id') id: string) {
     return this.playlistService.findSongs(id);
    }

    @Post()
    create(
        @Body() playlist: CreatePlaylistDto,
    ) {
        return this.playlistService.create(
            playlist.name, 
            playlist.userId, 
            playlist.isPublic
        );
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body('name') name: string,
    ){
        return this.playlistService.update(id, name);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.playlistService.delete(id);
    }

   
}
