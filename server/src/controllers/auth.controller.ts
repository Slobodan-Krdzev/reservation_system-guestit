import { Request, Response } from 'express';
import { registerUser, verifyEmailToken, loginUser, oauthLogin } from '../services/auth.service';
import { createHttpError } from '../utils/httpError';
import { env } from '../config/env';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { User } from '../models/User';

export const registerController = async (req: Request, res: Response) => {
  if (req.file) {
    req.body.avatarUrl = `/${req.file.path.replace(/\\/g, '/')}`;
  }
  const user = await registerUser(req.body);
  res.status(201).json({
    message: 'Account created. Please verify your email.',
    user: {
      id: user.id,
      email: user.email,
      isVerified: user.isVerified,
    },
  });
};

export const verifyController = async (req: Request, res: Response) => {
  const token = req.query.token as string;
  if (!token) {
    throw createHttpError(400, 'Verification token is required');
  }
  await verifyEmailToken(token);
  res.json({ message: 'Email verified successfully' });
};

export const loginController = async (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  const { user, accessToken, refreshToken } = await loginUser(identifier, password);
  res.cookie('token', accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    maxAge: 60 * 60 * 1000,
  });
  res.json({
    token: accessToken,
    refreshToken,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      subscription: user.subscription,
      reservations: user.reservations,
    },
  });
};

export const oauthController = async (req: Request, res: Response) => {
  const { provider, email, firstName, lastName, oauthId } = req.body;
  if (!provider || !email || !firstName || !lastName || !oauthId) {
    throw createHttpError(400, 'Missing OAuth payload');
  }
  const { user, accessToken, refreshToken } = await oauthLogin({
    provider,
    email,
    firstName,
    lastName,
    oauthId,
  });
  res.cookie('token', accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    maxAge: 60 * 60 * 1000,
  });
  res.json({
    token: accessToken,
    refreshToken,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      reservations: user.reservations,
    },
  });
};

export const refreshController = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw createHttpError(400, 'Refresh token is required');
  }
  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await User.findById(payload.sub);
    if (!user) {
      throw createHttpError(401, 'Invalid refresh token');
    }
    const newAccessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);
    res.json({
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    throw createHttpError(401, 'Invalid or expired refresh token');
  }
};

