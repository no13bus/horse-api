import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { Logger } from "winston";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Inject } from "@nestjs/common";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  use(request: Request, response: Response, next: NextFunction): void {
    // Skip logging in test environment
    if (process.env.NODE_ENV === "test") {
      return next();
    }

    // Record start time for calculating response time
    const startTime = Date.now();

    response.on("finish", () => {
      const { statusCode } = response;
      const { method, originalUrl, body } = request;
      const responseTime = Date.now() - startTime;

      // Prepare base log data
      const logData = {
        timestamp: new Date().toISOString(),
        method,
        url: originalUrl,
        statusCode,
        responseTime,
        requestBody: body,
      };

      if (statusCode >= 200 && statusCode < 400) {
        this.logger.info("Request processed", logData);
      } else {
        this.logger.error("Request failed", {
          ...logData,
        });
      }
    });

    next();
  }
}
