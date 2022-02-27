import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { Response } from 'express';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // https://www.prisma.io/docs/reference/api-reference/error-reference#prisma-client-query-engine
    switch (exception.code) {
      case 'P2000' || 'P2005' || 'P2006' || 'P2011' || 'P2012' || 'P2013' || 'P2014' || 'P2019':
        return response.sendStatus(HttpStatus.BAD_REQUEST);
      case 'P2001' || 'P2015' || 'P2018':
        return response.sendStatus(HttpStatus.NOT_FOUND);
      case 'P2002' || 'P2003' || 'P2004':
        return response.sendStatus(HttpStatus.CONFLICT);
      default:
        this.logger.error('Internal server error', exception.stack);
        return response.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
