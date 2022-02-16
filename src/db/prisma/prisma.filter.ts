import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { Response } from 'express';

@Catch(PrismaClientKnownRequestError)
export class PrismaFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // https://www.prisma.io/docs/reference/api-reference/error-reference#prisma-client-query-engine
    switch (exception.code) {
      case 'P2000' || 'P2005' || 'P2006' || 'P2011' || 'P2012' || 'P2013' || 'P2014' || 'P2019':
        response.status(HttpStatus.BAD_REQUEST);
        break;
      case 'P2001' || 'P2015' || 'P2018':
        response.status(HttpStatus.NOT_FOUND);
        break;
      case 'P2002' || 'P2003' || 'P2004':
        response.status(HttpStatus.CONFLICT);
        break;
      default:
        console.error(exception);
        throw new InternalServerErrorException();
    }
  }
}
