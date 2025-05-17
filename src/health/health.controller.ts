import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("health")
@Controller("api/health")
export class HealthController {
  @Get()
  @ApiOperation({ summary: "Basic health check" })
  @ApiResponse({
    status: 200,
    description: "API is healthy",
    schema: {
      example: {
        status: "ok",
        timestamp: "2024-03-21T10:00:00.000Z",
      },
    },
  })
  check() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}
