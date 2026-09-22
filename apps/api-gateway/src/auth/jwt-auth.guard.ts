import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload, Role } from "@app/shared/auth/role.enum";
import { AuthenticatedRequest } from "./authenticated-request";

/**
 * Verifies the `Authorization: Bearer <token>` header and attaches the
 * authenticated user to the request. Microservices receive the user id from
 * the gateway and never parse tokens themselves.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context
            .switchToHttp()
            .getRequest<AuthenticatedRequest>();
        const token = this.extractBearerToken(request.headers.authorization);

        if (!token) {
            throw new UnauthorizedException("Missing bearer token");
        }

        let payload: JwtPayload;
        try {
            payload = await this.jwtService.verifyAsync<JwtPayload>(token);
        } catch {
            throw new UnauthorizedException("Invalid or expired token");
        }

        if (
            !Number.isInteger(payload.sub) ||
            !Object.values(Role).includes(payload.role)
        ) {
            throw new UnauthorizedException("Invalid token payload");
        }

        request.user = {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
        };
        return true;
    }

    private extractBearerToken(header?: string): string | undefined {
        const [type, token] = header?.split(" ") ?? [];
        return type === "Bearer" && token ? token : undefined;
    }
}
