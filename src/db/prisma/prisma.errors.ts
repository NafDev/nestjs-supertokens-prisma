import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaError } from '../../types/prisma';

export function classifyPrismaError(error: unknown): [PrismaError, PrismaClientKnownRequestError] | undefined {
	let errorCode = '';
	let prismaError: PrismaClientKnownRequestError;

	if (error instanceof PrismaClientKnownRequestError) {
		errorCode = error.code;
		prismaError = error;
	} else {
		return;
	}

	// https://www.prisma.io/docs/reference/api-reference/error-reference#prisma-client-query-engine
	switch (errorCode.toString()) {
		case 'P2000':
		case 'P2005':
		case 'P2006':
		case 'P2011':
		case 'P2012':
		case 'P2013':
		case 'P2014':
		case 'P2019':
			return [PrismaError.INVALID_REQUEST, prismaError];
		case 'P2001':
		case 'P2015':
		case 'P2018':
		case 'P2025':
			return [PrismaError.NOT_FOUND, prismaError];
		case 'P2002':
		case 'P2003':
		case 'P2004':
			return [PrismaError.CONSTRAINT_FAILED, prismaError];
		default:
			return [PrismaError.UNKNOWN, prismaError];
	}
}
