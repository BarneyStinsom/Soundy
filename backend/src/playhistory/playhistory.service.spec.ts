import { Test, TestingModule } from '@nestjs/testing';
import { PlayHistoryService } from './playhistory.service.js';

describe('PlayHistoryService', () => {
  let service: PlayHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlayHistoryService],
    }).compile();

    service = module.get<PlayHistoryService>(PlayHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
