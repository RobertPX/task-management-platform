import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger';

interface ErrorResponse {
  success: false;
  message: string;
  stack?: string;
  errors?: any;
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  const errorResponse: ErrorResponse = {
    success: false,
    message: err.message || 'Internal server error'
  };

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        errorResponse.message = 'A record with this value already exists';
        res.status(409).json(errorResponse);
        return;
      case 'P2025':
        errorResponse.message = 'Record not found';
        res.status(404).json(errorResponse);
        return;
      case 'P2003':
        errorResponse.message = 'Invalid foreign key reference';
        res.status(400).json(errorResponse);
        return;
      default:
        errorResponse.message = 'Database error occurred';
        res.status(500).json(errorResponse);
        return;
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    errorResponse.message = 'Invalid data provided';
    res.status(400).json(errorResponse);
    return;
  }

  // Default error
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  const statusCode = (err as any).statusCode || 500;
  res.status(statusCode).json(errorResponse);
};