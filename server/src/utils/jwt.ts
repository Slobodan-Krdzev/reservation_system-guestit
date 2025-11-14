import jwt, { type Secret } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { env } from '../config/env';

export interface JwtPayload {
  sub: string;
  type: 'access' | 'refresh';
}

export const generateAccessToken = (userId: string): string => {
  const expiresIn = env.jwtExpiresIn as StringValue;
  const options: jwt.SignOptions = { expiresIn };
  return jwt.sign({ sub: userId, type: 'access' }, env.jwtSecret as Secret, options);
};

export const generateRefreshToken = (userId: string): string => {
  const expiresIn = env.refreshExpiresIn as StringValue;
  const options: jwt.SignOptions = { expiresIn };
  return jwt.sign({ sub: userId, type: 'refresh' }, env.refreshSecret as Secret, options);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
};

