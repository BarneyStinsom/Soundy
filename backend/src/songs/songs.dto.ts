import { IsInt, IsNotEmpty, IsString, IsUUID, Min } from 'class-validator';

export class CreateSongDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsInt()
  @Min(30)
  duration: number;

  @IsString()
  @IsNotEmpty()
  songUrl: string;

  @IsUUID()
  artistId: string;

  @IsUUID()
  albumId: string;

  @IsUUID()
  id: string;
}





