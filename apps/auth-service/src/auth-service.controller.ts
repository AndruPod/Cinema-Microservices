import { Controller, Get } from "@nestjs/common";
import { AuthServiceService } from "./auth-service.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { AuthPatterns } from "@app/shared/constants/services";
import { RegisterDto } from "@app/shared/dtos/register.dto";
import { LoginDto } from "@app/shared/dtos/login.dto";

@Controller()
export class AuthServiceController {
    constructor(private readonly authServiceService: AuthServiceService) {}

    @MessagePattern(AuthPatterns.REGISTER)
    async register(@Payload() dto: RegisterDto) {
        return await this.authServiceService.register(dto);
    }

    @MessagePattern(AuthPatterns.LOGIN)
    async login(@Payload() dto: LoginDto) {
        return await this.authServiceService.login(dto);
    }

}