import { IsNotEmpty, IsString, IsUUID, IsBoolean, IsOptional, IsUrl } from 'class-validator';

export class CreatePlaylistDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  userId: string;

  @IsBoolean()
  isPublic: boolean;

  @IsString()
  @IsOptional()
  coverUrl?: string;
}