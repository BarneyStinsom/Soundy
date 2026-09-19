import {
  Body, Controller, Delete, Get,  Param, Patch, Post
} from '@nestjs/common';
import { AlbumsService } from './album.service.js';
import { CreateAlbumDto } from './album.dto.js';

@Controller('albums')
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  @Get()
  findAll() {
    return this.albumsService.findAll();
  }
  @Get(':id/songs') findSongs(@Param('id') id: string) { 
    return this.albumsService.findSongs(id); }
    
  @Get(':id') 
  findOne(@Param('id') id: string) {
    return this.albumsService.findOne(id);
  }

  @Post()
create(@Body() album: CreateAlbumDto) {
  return this.albumsService.create(
    album.title,
    album.type,
    album.artistId,
    album.coverUrl
  );
}

  @Patch(':id')
  update(
    @Param('id') id: string, @Body() album: CreateAlbumDto
  ) {
    return this.albumsService.update(id, album.title, album.type);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.albumsService.delete(id);
  }
 
}