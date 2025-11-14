import { Reservation } from '../models/Reservation';
import { createHttpError } from '../utils/httpError';

interface ReservationInput {
  userId: string;
  floorplanId: string;
  tableId: string;
  date: string;
  timeSlot: string;
  guests: number;
}

export const listReservations = (userId: string) => {
  return Reservation.find({ userId }).sort({ createdAt: -1 });
};

export const createReservation = async (input: ReservationInput) => {
  const conflict = await Reservation.findOne({
    tableId: input.tableId,
    floorplanId: input.floorplanId,
    date: input.date,
    timeSlot: input.timeSlot,
    status: 'active',
  });

  if (conflict) {
    throw createHttpError(409, 'Table already reserved for that time slot');
  }

  const reservation = await Reservation.create({
    ...input,
    status: 'active',
  });

  return reservation;
};

export const cancelReservation = async (reservationId: string, userId: string) => {
  const reservation = await Reservation.findOne({ _id: reservationId, userId });
  if (!reservation) {
    throw createHttpError(404, 'Reservation not found');
  }
  reservation.status = 'cancelled';
  await reservation.save();
  return reservation;
};

