import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { ApiStatus, NODE_ENV } from '../enums';
import * as process from 'process';
import { config } from 'dotenv';
config();

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    let message: any;
    if (process?.env?.NODE_ENV == NODE_ENV.DEV) {
      message = exception.getResponse();
    } else {
      message = 'An error occurred. Please try again later';
    }
    response.status(status).json({
      status: ApiStatus.FAILED,
      message: message,
    });
  }
}
