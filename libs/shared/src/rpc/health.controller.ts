import { Controller, ServiceUnavailableException } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { DataSource } from "typeorm";
import { CommonPatterns } from "../constants/services";

export interface HealthStatus {
    status: "ok";
    database: "up";
}

/** Answers health checks from the gateway after pinging the service database. */
@Controller()
export class DatabaseHealthController {
    constructor(private readonly dataSource: DataSource) {}

    @MessagePattern(CommonPatterns.HEALTH)
    async check(): Promise<HealthStatus> {
        try {
            await this.dataSource.query("SELECT 1");
        } catch {
            throw new ServiceUnavailableException("Database is unreachable");
        }

        return { status: "ok", database: "up" };
    }
}
