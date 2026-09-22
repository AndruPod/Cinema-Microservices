import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { AuthPatterns } from "@app/shared/constants/services";
import { UserIdPayload } from "@app/shared/dtos/common/id-payloads";
import { LoginDto } from "@app/shared/dtos/auth/login.dto";
import { RegisterDto } from "@app/shared/dtos/auth/register.dto";
import { AuthService } from "./auth.service";

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @MessagePattern(AuthPatterns.REGISTER)
    register(@Payload() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @MessagePattern(AuthPatterns.LOGIN)
    login(@Payload() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @MessagePattern(AuthPatterns.GET_PROFILE)
    getProfile(@Payload() { userId }: UserIdPayload) {
        return this.authService.getProfile(userId);
    }
}
