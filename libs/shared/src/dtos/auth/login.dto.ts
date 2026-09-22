import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { normalizeEmail } from "./normalize-email";

export class LoginDto {
    @Transform(normalizeEmail)
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(72)
    password: string;
}
