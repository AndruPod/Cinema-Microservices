import { IsNotEmpty, IsOptional, IsString } from "class-validator";


export class RegisterDto {

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    confirmPassword: string;

    @IsString()
    @IsOptional()
    role: string;

}