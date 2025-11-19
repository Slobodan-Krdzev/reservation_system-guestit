import { Request, Response } from 'express';
import {
  createReservation,
  listReservations,
  cancelReservation,
  updateReservationStatus,
} from '../services/reservation.service';

export const listReservationsController = async (req: Request, res: Response) => {
  const { reservations, favorites } = await listReservations(req.user!.id);
  res.json({ reservations, favorites });
};

export const createReservationController = async (req: Request, res: Response) => {
  const reservation = await createReservation({
    ...req.body,
    userId: req.user!.id,
  });
  res.status(201).json({ reservation });
};

export const cancelReservationController = async (req: Request, res: Response) => {
  const reservation = await cancelReservation(req.params.id, req.user!.id);
  res.json({ reservation });
};

export const updateStatusController = async (req: Request, res: Response) => {
  const { status } = req.body as { status: 'pending' | 'active' | 'cancelled' | 'finished' };
  const reservation = await updateReservationStatus(req.params.id, status);
  res.json({ reservation });
};

