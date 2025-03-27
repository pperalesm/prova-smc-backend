import { Request, Response, NextFunction } from "express";
import { Injectable, NestMiddleware, Logger } from "@nestjs/common";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger("HTTP");

  use(req: Request, res: Response, next: NextFunction) {
    const startAt = process.hrtime();

    res.on("finish", () => {
      const { method, originalUrl } = req;
      const body = originalUrl.includes("auth") ? {} : req.body;
      const { statusCode } = res;
      const diff = process.hrtime(startAt);
      const responseTime = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(0);

      if (statusCode < 400) {
        this.logger.log(
          `${JSON.stringify({
            statusCode,
            method,
            originalUrl,
            body,
          })} \x1b[33m+${responseTime}ms\x1b[0m`,
        );
      } else {
        this.logger.error(
          `${JSON.stringify({
            statusCode,
            method,
            originalUrl,
            body,
          })} \x1b[33m+${responseTime}ms\x1b[0m`,
        );
      }
    });

    next();
  }
}
