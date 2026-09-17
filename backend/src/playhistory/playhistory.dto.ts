import { IsUUID, IsNotEmpty, IsString } from 'class-validator';

export class CreatePlayHistoryDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  songId: string;
 
  @IsString()
  @IsNotEmpty()
  playedAt: string;  
}
