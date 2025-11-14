import { Schema, model, type Document, type Types } from 'mongoose';

export type ReservationStatus = 'active' | 'cancelled' | 'completed';

export interface IReservation extends Document {
  userId: Types.ObjectId;
  floorplanId: string;
  tableId: string;
  date: string;
  timeSlot: string;
  guests: number;
  status: ReservationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const reservationSchema = new Schema<IReservation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    floorplanId: { type: String, required: true },
    tableId: { type: String, required: true },
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    guests: { type: Number, required: true },
    status: { type: String, enum: ['active', 'cancelled', 'completed'], default: 'active' },
  },
  { timestamps: true },
);

export const Reservation = model<IReservation>('Reservation', reservationSchema);

