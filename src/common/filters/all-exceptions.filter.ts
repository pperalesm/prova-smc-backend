import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { ThrottlerException } from "@nestjs/throttler";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private logger = new Logger("FILTER");

  constructor(private httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost) {
    this.logger.error(exception.stack);

    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let responseBody;
    if (exception instanceof ThrottlerException) {
      responseBody = {
        statusCode: 429,
        message: "Try again later.",
        error: "Too Many Requests.",
      };
    } else if (exception instanceof HttpException) {
      responseBody = (exception as HttpException).getResponse();
    } else {
      responseBody = {
        statusCode: 500,
        message: "Something went wrong.",
        error: "Internal Server Error.",
      };
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, statusCode);
  }
}
