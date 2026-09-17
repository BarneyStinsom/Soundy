import { Controller, Get, Param, Post, Body, Patch, Delete } from '@nestjs/common';

import { ArtistsService } from './artists.service.js';
import { CreateArtistDto } from './artists.dto.js';

@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Get()
  findAll() {
    return this.artistsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.artistsService.findOne(id);
  }
  @Post()
create(@Body() artist: CreateArtistDto) {
  return this.artistsService.create(artist.name);
}
@Patch(':id')
update(
  @Param('id') id: string,
  @Body() artist: CreateArtistDto,
) {
  return this.artistsService.update(id, artist.name);
}
@Delete(':id')
remove(@Param('id') id: string) {
  return this.artistsService.delete(id);
}
  @Get(':id/albums') findAlbums(@Param('id') id: string) {
    return this.artistsService.findAlbums(id);
  }
}