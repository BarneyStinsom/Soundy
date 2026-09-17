import { Controller, Patch, Get, Delete, Param, Body, Post } from '@nestjs/common';
import { PlaylistsongsService } from './playlistsongs.service.js';
import { CreatePlaylistSongDto } from './playlistsongs.dto.js';
@Controller('playlistsongs')
export class PlaylistsongsController {
        constructor(private readonly playlistsongService: PlaylistsongsService) {}
        
        @Get()
        findAll() {
                return this.playlistsongService.findAll();
        }
        
        @Post()
        create(
                @Body() playlistsong: CreatePlaylistSongDto
        ) {
                 return this.playlistsongService.create(
                        playlistsong.playlistId, 
                        playlistsong.songId, 
                        playlistsong.position);
        }
       
        @Patch(':id')
        update(
            @Param('id') id: string,
            @Body() playlistsong: CreatePlaylistSongDto,
        ) {
            return this.playlistsongService.update(id, playlistsong.position);
        }
        @Delete(':id')
        delete(@Param('id') id: string){
                return this.playlistsongService.delete(id);
        }
        
}
