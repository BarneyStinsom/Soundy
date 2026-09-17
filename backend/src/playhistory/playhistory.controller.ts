import { Controller, Get, Patch, Body, Param, Post, Delete } from '@nestjs/common';
import { PlayHistoryService } from './playhistory.service.js';
import { CreatePlayHistoryDto } from './playhistory.dto.js';
@Controller('playhistory')
export class PlayHistoryController {
    constructor(private readonly playhistoryService: PlayHistoryService) {}
    
    @Get()
    findAll() {
        return this.playhistoryService.findAll();
    }
    @Post()
    create(
        @Body() playhistory: CreatePlayHistoryDto
    ) {
        return this.playhistoryService.create(
            playhistory.userId, 
            playhistory.songId, 
            playhistory.playedAt
        );
    }
    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.playhistoryService.delete(id);
    }

}
