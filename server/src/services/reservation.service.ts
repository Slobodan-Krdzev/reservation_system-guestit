import { Types } from 'mongoose';
import { Reservation, type ReservationStatus, type IReservation } from '../models/Reservation';
import { User } from '../models/User';
import { Notification } from '../models/Notification';
import { createHttpError } from '../utils/httpError';
import { sendReservationApprovalEmail } from '../config/mailer';

interface ReservationInput {
  userId: string;
  floorplanId: string;
  tableId: string;
  tableName?: string;
  date: string;
  timeSlot: string;
  guests: number;
  note?: string;
}

const resolveReservationDate = (date: string, timeSlot: string): Date | null => {
  const isoString = `${date}T${timeSlot}:00`;
  const parsed = new Date(isoString);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
};

const refreshReservationStatuses = async (reservations: IReservation[]) => {
  const now = new Date();
  const updates: Promise<unknown>[] = [];

  reservations.forEach((reservation) => {
    if (reservation.status === 'pending' || reservation.status === 'active') {
      const targetDate = resolveReservationDate(reservation.date, reservation.timeSlot);
      if (targetDate && targetDate < now) {
        reservation.status = 'finished';
        updates.push(reservation.save());
      }
    }
  });

  if (updates.length) {
    await Promise.all(updates);
  }
};

interface FavoriteSummary {
  tableId: string;
  tableName?: string;
  floorplanId: string;
  count: number;
  lastDate?: string;
  lastTime?: string;
}

export const listReservations = async (
  userId: string,
): Promise<{ reservations: IReservation[]; favorites: FavoriteSummary[] }> => {
  const reservations = await Reservation.find({ userId }).sort({ createdAt: -1 });
  await refreshReservationStatuses(reservations);

  const favorites = await Reservation.aggregate<FavoriteSummary>([
    { $match: { userId: new Types.ObjectId(userId), status: 'finished' } },
    {
      $group: {
        _id: '$tableId',
        count: { $sum: 1 },
        tableName: { $last: '$tableName' },
        floorplanId: { $last: '$floorplanId' },
        lastDate: { $last: '$date' },
        lastTime: { $last: '$timeSlot' },
      },
    },
    { $sort: { count: -1, _id: 1 } },
    { $limit: 2 },
    {
      $project: {
        _id: 0,
        tableId: '$_id',
        tableName: 1,
        floorplanId: 1,
        count: 1,
        lastDate: 1,
        lastTime: 1,
      },
    },
  ]);

  return { reservations, favorites };
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
    status: 'pending',
  });

  await User.findByIdAndUpdate(input.userId, {
    $addToSet: { reservations: reservation._id },
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

export const updateReservationStatus = async (
  reservationId: string,
  status: ReservationStatus,
) => {
  const reservation = await Reservation.findById(reservationId);
  if (!reservation) {
    throw createHttpError(404, 'Reservation not found');
  }
  reservation.status = status;
  await reservation.save();
  return reservation;
};

/**
 * Approves a pending reservation and sends an approval email to the user.
 * This is used for the demo/MVP flow where reservations are auto-approved after 30 seconds.
 */
export const approvePendingReservation = async (
  reservationId: string,
): Promise<IReservation | null> => {
  const reservation = await Reservation.findById(reservationId).populate<{
    userId: { firstName: string; lastName: string; email: string };
  }>('userId', 'firstName lastName email');

  if (!reservation) {
    return null;
  }

  if (reservation.status !== 'pending') {
    return null;
  }

  reservation.status = 'active';
  await reservation.save();

  // Send approval email
  const user = reservation.userId as unknown as { firstName: string; lastName: string; email: string };
  if (user && user.email) {
    try {
      await sendReservationApprovalEmail(user.email, {
        firstName: user.firstName,
        lastName: user.lastName,
        tableName: reservation.tableName || `Table ${reservation.tableId}`,
        date: reservation.date,
        timeSlot: reservation.timeSlot,
        guests: reservation.guests,
      });
    } catch (error) {
      // Log error but don't fail the approval
      // eslint-disable-next-line no-console
      console.error(`Failed to send approval email for reservation ${reservationId}:`, error);
    }
  }

  // Create in-app notification
  try {
    await Notification.create({
      userId: reservation.userId,
      type: 'reservationApproved',
      message: `Your reservation for ${
        reservation.tableName || `Table ${reservation.tableId}`
      } on ${reservation.date} at ${reservation.timeSlot} has been approved.`,
      reservationId: reservation._id,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to create notification for reservation ${reservationId}:`, error);
  }

  return reservation;
};

/**
 * Processes pending reservations that are older than 30 seconds and approves them.
 * This is the demo/MVP auto-approval logic.
 */
export const processPendingReservations = async (): Promise<void> => {
  const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);

  const pendingReservations = await Reservation.find({
    status: 'pending',
    createdAt: { $lte: thirtySecondsAgo },
  });

  for (const reservation of pendingReservations) {
    try {
      await approvePendingReservation(reservation._id.toString());
      // eslint-disable-next-line no-console
      console.log(`Auto-approved reservation ${reservation._id} (demo flow)`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to approve reservation ${reservation._id}:`, error);
    }
  }
};

