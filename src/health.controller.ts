import { Controller, Get } from "@nestjs/common";
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
} from "@nestjs/terminus";
import { SMC_S3_KEY, SMC_S3_URL } from "./app.constants";
import { HEALTH_URL } from "./app.constants";

@Controller(HEALTH_URL)
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async checkDb() {
    return await this.health.check([
      () => this.http.pingCheck(SMC_S3_KEY, SMC_S3_URL),
    ]);
  }
}
