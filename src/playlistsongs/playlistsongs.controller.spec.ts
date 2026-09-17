import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistsongsController } from './playlistsongs.controller.js';

describe('PlaylistsongsController', () => {
  let controller: PlaylistsongsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaylistsongsController],
    }).compile();

    controller = module.get<PlaylistsongsController>(PlaylistsongsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
