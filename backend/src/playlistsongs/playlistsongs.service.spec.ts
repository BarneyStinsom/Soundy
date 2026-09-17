import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistsongsService } from './playlistsongs.service.js';

describe('PlaylistsongsService', () => {
  let service: PlaylistsongsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlaylistsongsService],
    }).compile();

    service = module.get<PlaylistsongsService>(PlaylistsongsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
