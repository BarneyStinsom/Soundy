import { Module } from '@nestjs/common';
import { PlayHistoryController } from './playhistory.controller.js';
import { PlayHistoryService } from './playhistory.service.js';

@Module({
  controllers: [PlayHistoryController],
  providers: [PlayHistoryService]
})
export class PlayHistoryModule {}
