import { Body, Controller, Post, Patch, Delete, Get, Param, Query } from '@nestjs/common';
import { SongsService } from './songs.service.js';
import { CreateSongDto } from './songs.dto.js';
@Controller('songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Get()
  findAll() {
    return this.songsService.findAll();
  }
  @Get('top')
findTop(@Query('limit') limit?: string) {
  const parsedLimit = limit ? parseInt(limit, 10) : 10;
  return this.songsService.findTopSongs(parsedLimit);
}
 @Post()
         create(
           @Body() song: CreateSongDto
         ) {
           return this.songsService.create(
             song.title, 
             song.duration, 
             song.songUrl,
             song.songCoverUrl,
             song.artistId,
             song.albumId
           );
         }

 
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