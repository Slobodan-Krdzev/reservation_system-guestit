import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/httpError';
import { env } from '../config/env';

export const errorHandler = (
  err: Error | HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const statusCode = err instanceof HttpError ? err.statusCode : 500;
  const message = err.message || 'Unexpected error';

  res.status(statusCode).json({
    message,
    ...(env.nodeEnv === 'development' && { stack: err.stack }),
  });
};

