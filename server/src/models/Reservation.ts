import { Schema, model, type Document, type Types } from 'mongoose';

export type ReservationStatus = 'pending' | 'active' | 'cancelled' | 'finished';

export interface IReservation extends Document {
  userId: Types.ObjectId;
  floorplanId: string;
  tableId: string;
  tableName?: string;
  date: string;
  timeSlot: string;
  guests: number;
  note?: string;
  status: ReservationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const reservationSchema = new Schema<IReservation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    floorplanId: { type: String, required: true },
    tableId: { type: String, required: true },
    tableName: { type: String },
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    guests: { type: Number, required: true },
    note: { type: String },
    status: {
      type: String,
      enum: ['pending', 'active', 'cancelled', 'finished'],
      default: 'pending',
    },
  },
  { timestamps: true },
);

export const Reservation = model<IReservation>('Reservation', reservationSchema);

