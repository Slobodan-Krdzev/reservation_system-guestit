import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { User } from '../models/User';
import { createHttpError } from '../utils/httpError';

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      authHeader?.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : (req.cookies?.token as string | undefined);

    if (!token) {
      throw createHttpError(401, 'Authentication required');
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);
    if (!user) {
      throw createHttpError(401, 'User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    next(createHttpError(401, 'Invalid or expired token'));
  }
};

