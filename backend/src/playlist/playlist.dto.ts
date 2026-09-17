import { IsNotEmpty, IsString, IsUUID, IsBoolean } from 'class-validator';

export class CreatePlaylistDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  userId: string;

  @IsBoolean()
  isPublic: boolean;

}