import { IsNotEmpty, IsUUID, IsInt, Min } from 'class-validator';

export class CreatePlaylistSongDto {
  @IsUUID()
  @IsNotEmpty()
  playlistId: string;

  @IsUUID()
  @IsNotEmpty()
  songId: string;

  @IsInt()
  @Min(1)
  position: number;
}
