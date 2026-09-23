import { IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';

export class CreateAlbumDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsUUID()
  artistId: string;

  @IsString()
  @IsOptional()
  coverUrl?: string;
}

