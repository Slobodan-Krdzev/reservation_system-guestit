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
    updates.avatarUrl = `/${req.file.path.replace(/\\/g, '/')}`;
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
  const user = await User.findById(req.user!.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.subscription = {
    tier: 'premium',
    status: 'active',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  };
  await user.save();

  res.json({
    message: 'Subscription activated (mock). Replace with Stripe integration.',
    subscription: user.subscription,
  });
};

