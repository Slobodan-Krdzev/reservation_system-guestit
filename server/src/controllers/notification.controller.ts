import { Request, Response } from 'express';
import { Notification } from '../models/Notification';

export const listUnreadNotificationsController = async (req: Request, res: Response) => {
  const notifications = await Notification.find({
    userId: req.user!.id,
    read: false,
  })
    .sort({ createdAt: -1 })
    .limit(10);

  if (notifications.length) {
    await Notification.updateMany(
      { _id: { $in: notifications.map((n) => n._id) } },
      { $set: { read: true } },
    );
  }

  res.json({ notifications });
};


