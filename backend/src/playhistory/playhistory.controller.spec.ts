import { Test, TestingModule } from '@nestjs/testing';
import { PlayHistoryController } from './playhistory.controller.js';

describe('PlayHistoryController', () => {
  let controller: PlayHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayHistoryController],
    }).compile();

    controller = module.get<PlayHistoryController>(PlayHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
