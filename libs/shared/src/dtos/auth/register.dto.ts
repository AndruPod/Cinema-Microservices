import { Transform } from "class-transformer";
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
} from "class-validator";
import { normalizeEmail } from "./normalize-email";

export class RegisterDto {
    @Transform(normalizeEmail)
    @IsEmail()
    @MaxLength(255)
    email: string;

    // bcrypt only uses the first 72 bytes of a password.
    @IsString()
    @MinLength(8)
    @MaxLength(72)
    password: string;

    @IsString()
    @IsNotEmpty()
    confirmPassword: string;
}
