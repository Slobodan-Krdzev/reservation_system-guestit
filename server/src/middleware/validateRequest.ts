import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { createHttpError } from '../utils/httpError';

export const validateRequest = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((err) => {
        const anyErr = err as Record<string, unknown>;
        const key =
          (typeof anyErr.param === 'string' && anyErr.param) ||
          (typeof anyErr.type === 'string' && anyErr.type) ||
          'unknown';
        const msg = typeof anyErr.msg === 'string' ? anyErr.msg : 'Invalid input';
        return `${key}: ${msg}`;
      })
      .join(', ');
    throw createHttpError(400, `Validation failed: ${errorMessages}`);
  }
  next();
};

