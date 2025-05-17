import { WinstonModuleOptions } from "nest-winston";
import * as winston from "winston";
import { utilities as nestWinstonModuleUtilities } from "nest-winston";
import { join } from "path";

// Ensure log directory exists
const logDir = "logs";

export const winstonConfig: WinstonModuleOptions = {
  transports: [
    // Error log file - stores only error level logs
    new winston.transports.File({
      filename: join(logDir, "error.log"),
      level: "error",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    // Combined log file - stores all level logs
    new winston.transports.File({
      filename: join(logDir, "combined.log"),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    // Console output with pretty formatting
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        nestWinstonModuleUtilities.format.nestLike("Horse-API", {
          prettyPrint: true,
        }),
      ),
    }),
  ],
};
