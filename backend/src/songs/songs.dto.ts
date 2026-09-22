import { IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID, Min } from 'class-validator';

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

  @IsString()
  @IsOptional()
  songCoverUrl: string;
}



  

