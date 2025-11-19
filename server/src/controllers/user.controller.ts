import { Request, Response } from 'express';
import { User } from '../models/User';

export const meController = async (req: Request, res: Response) => {
  res.json({
    user: {
      id: req.user!.id,
      firstName: req.user!.firstName,
      lastName: req.user!.lastName,
      email: req.user!.email,
      phone: req.user!.phone,
      avatarUrl: req.user!.avatarUrl,
      subscription: req.user!.subscription,
      reservations: req.user!.reservations,
    },
  });
};

export const updateProfileController = async (req: Request, res: Response) => {
  const updates: Record<string, unknown> = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phone: req.body.phone,
  };
  if (req.file) {
    // req.file.path is relative to process.cwd(), convert to URL path
    const relativePath = req.file.path.replace(/\\/g, '/');
    // Ensure it starts with /uploads
    updates.avatarUrl = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  }
  Object.keys(updates).forEach((key) => {
    if (!updates[key]) {
      delete updates[key];
    }
  });
  const user = await User.findByIdAndUpdate(req.user!.id, updates, { new: true });
  res.json({ user });
};

export const activateSubscriptionController = async (req: Request, res: Response) => {
  const { cardNumber, cardHolder, expiry, cvc } = req.body;

  if (!cardNumber || !cardHolder || !expiry || !cvc) {
    return res.status(400).json({ message: 'Please provide complete payment details.' });
  }

  if (typeof cardNumber !== 'string' || cardNumber.replace(/\s+/g, '').length < 12) {
    return res.status(400).json({ message: 'Invalid card number.' });
  }

  const user = await User.findById(req.user!.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const now = new Date();
  const oneYearMs = 365 * 24 * 60 * 60 * 1000;

  user.subscription = {
    tier: 'premium',
    status: 'active',
    startedAt: now,
    expiresAt: new Date(now.getTime() + oneYearMs),
  };
  await user.save();

  res.json({
    message: 'Gold membership activated (demo payment).',
    subscription: user.subscription,
  });
};

export const cancelSubscriptionController = async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.subscription = {
    tier: 'free',
    status: 'inactive',
  };

  await user.save();

  res.json({
    message: 'Subscription cancelled.',
    subscription: user.subscription,
  });
};

