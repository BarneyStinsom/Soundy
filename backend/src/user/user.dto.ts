import { IsEmail, IsNotEmpty, IsString, IsOptional, IsUrl, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean;

  @IsOptional()
  @IsUrl()
  pictureUrl?: string;
}
