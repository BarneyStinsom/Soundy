import { Controller, Get, Param, Post, Body, Patch, Delete } from '@nestjs/common';

import { ArtistsService } from './artists.service.js';

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
create(@Body('name') name: string) {
  return this.artistsService.create(name);
}
@Patch(':id')
update(
  @Param('id') id: string,
  @Body('name') name: string,
) {
  return this.artistsService.update(id, name);
}
@Delete(':id')
remove(@Param('id') id: string) {
  return this.artistsService.delete(id);
}
}