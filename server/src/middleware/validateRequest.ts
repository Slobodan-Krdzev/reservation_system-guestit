import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { createHttpError } from '../utils/httpError';

export const validateRequest = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createHttpError(400, 'Validation failed');
  }
  next();
};

