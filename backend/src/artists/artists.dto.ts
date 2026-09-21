import { IsNotEmpty, IsString, IsUrl, IsOptional} from 'class-validator';

export class CreateArtistDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsUrl()
    @IsOptional()
    coverUrl?: string;

}