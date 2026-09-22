import {
    Controller,
    Get,
    Inject,
    ServiceUnavailableException,
} from "@nestjs/common";
import { CommonPatterns, Services } from "@app/shared/constants/services";
import { RpcClient } from "@app/shared/rpc/rpc-client";

type ServiceState = "up" | "down";

export interface GatewayHealth {
    status: "ok" | "error";
    services: Record<"auth" | "catalog" | "order", ServiceState>;
}

@Controller("health")
export class HealthController {
    constructor(
        @Inject(Services.AUTH) private readonly auth: RpcClient,
        @Inject(Services.CATALOG) private readonly catalog: RpcClient,
        @Inject(Services.ORDER) private readonly order: RpcClient,
    ) {}

    /** 200 when every service and its database respond, 503 otherwise. */
    @Get()
    async check(): Promise<GatewayHealth> {
        const [auth, catalog, order] = await Promise.all(
            [this.auth, this.catalog, this.order].map((client) =>
                this.ping(client),
            ),
        );
        const health: GatewayHealth = {
            status: [auth, catalog, order].every((state) => state === "up")
                ? "ok"
                : "error",
            services: { auth, catalog, order },
        };

        if (health.status !== "ok") {
            throw new ServiceUnavailableException(health);
        }
        return health;
    }

    private async ping(client: RpcClient): Promise<ServiceState> {
        try {
            await client.send(CommonPatterns.HEALTH, {});
            return "up";
        } catch {
            return "down";
        }
    }
}
