import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    Post,
    UseGuards,
} from "@nestjs/common";
import type { AuthUser } from "@app/shared/auth/role.enum";
import { AuthPatterns, Services } from "@app/shared/constants/services";
import { AccessToken, PublicUser } from "@app/shared/dtos/auth/auth-responses";
import { LoginDto } from "@app/shared/dtos/auth/login.dto";
import { RegisterDto } from "@app/shared/dtos/auth/register.dto";
import { UserIdPayload } from "@app/shared/dtos/common/id-payloads";
import { RpcClient } from "@app/shared/rpc/rpc-client";
import { CurrentUser } from "./current-user.decorator";
import { JwtAuthGuard } from "./jwt-auth.guard";

@Controller("auth")
export class AuthController {
    constructor(@Inject(Services.AUTH) private readonly auth: RpcClient) {}

    @Post("register")
    register(@Body() dto: RegisterDto): Promise<PublicUser> {
        return this.auth.send<PublicUser, RegisterDto>(
            AuthPatterns.REGISTER,
            dto,
        );
    }

    @Post("login")
    @HttpCode(HttpStatus.OK)
    login(@Body() dto: LoginDto): Promise<AccessToken> {
        return this.auth.send<AccessToken, LoginDto>(AuthPatterns.LOGIN, dto);
    }

    @Get("me")
    @UseGuards(JwtAuthGuard)
    me(@CurrentUser() user: AuthUser): Promise<PublicUser> {
        return this.auth.send<PublicUser, UserIdPayload>(
            AuthPatterns.GET_PROFILE,
            { userId: user.id },
        );
    }
}
