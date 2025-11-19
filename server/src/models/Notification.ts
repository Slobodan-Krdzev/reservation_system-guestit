import { Schema, model, type Document, type Types } from 'mongoose';

export type NotificationType = 'reservationApproved';

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: NotificationType;
  message: string;
  reservationId?: Types.ObjectId;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['reservationApproved'], required: true },
    message: { type: String, required: true },
    reservationId: { type: Schema.Types.ObjectId, ref: 'Reservation' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Notification = model<INotification>('Notification', notificationSchema);


