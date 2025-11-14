import { v4 as uuid } from 'uuid';
import { User, type IUser } from '../models/User';
import { hashPassword, comparePassword } from '../utils/password';
import { createHttpError } from '../utils/httpError';
import { sendVerificationEmail } from '../config/mailer';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../utils/jwt';

interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  avatarUrl?: string;
}

export const registerUser = async (input: RegisterInput): Promise<IUser> => {
  const existing = await User.findOne({
    $or: [{ email: input.email.toLowerCase() }, { phone: input.phone }],
  });

  if (existing) {
    throw createHttpError(409, 'Email or phone already in use');
  }

  const verificationToken = uuid();
  const user = await User.create({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email.toLowerCase(),
    phone: input.phone,
    passwordHash: await hashPassword(input.password),
    ...(input.avatarUrl && { avatarUrl: input.avatarUrl }),
    verificationToken,
  });

  await sendVerificationEmail(user.email, verificationToken);
  return user;
};

export const verifyEmailToken = async (token: string): Promise<IUser> => {
  const user = await User.findOne({ verificationToken: token });
  if (!user) {
    throw createHttpError(400, 'Invalid verification token');
  }
  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();
  return user;
};

export const loginUser = async (
  identifier: string,
  password: string,
): Promise<{ user: IUser; accessToken: string; refreshToken: string }> => {
  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
  });
  if (!user) {
    throw createHttpError(401, 'Invalid credentials');
  }
  if (!user.isVerified) {
    throw createHttpError(403, 'Please verify your email before logging in');
  }
  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    throw createHttpError(401, 'Invalid credentials');
  }
  return {
    user,
    accessToken: generateAccessToken(user.id),
    refreshToken: generateRefreshToken(user.id),
  };
};

interface OAuthInput {
  provider: 'google' | 'facebook' | 'apple';
  email: string;
  firstName: string;
  lastName: string;
  oauthId: string;
}

export const oauthLogin = async ({
  provider,
  email,
  firstName,
  lastName,
}: OAuthInput) => {
  let user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone: `oauth-${provider}-${Date.now()}`,
      passwordHash: await hashPassword(uuid()),
      isVerified: true,
    });
  }

  return {
    user,
    accessToken: generateAccessToken(user.id),
    refreshToken: generateRefreshToken(user.id),
  };
};

