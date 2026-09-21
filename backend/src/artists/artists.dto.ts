import { IsNotEmpty, IsString, IsUrl, IsOptional} from 'class-validator';

export class CreateArtistDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    coverUrl?: string;

}