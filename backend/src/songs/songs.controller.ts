import { Body, Controller, Post, Patch, Delete, Get, Param } from '@nestjs/common';
import { SongsService } from './songs.service.js';
import { CreateSongDto } from './songs.dto.js';
@Controller('songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Get()
  findAll() {
    return this.songsService.findAll();
  }

 @Post() create(@Body() createSongDto: CreateSongDto) { 
    return this.songsService.create( createSongDto.title, 
    createSongDto.duration, 
    createSongDto.songUrl,
    createSongDto.artistId, 
    createSongDto.albumId, ); }

 
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() song: CreateSongDto
  ) {
   return this.songsService.update(song.id, song.title);
  }  

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.songsService.delete(id);
  }

}