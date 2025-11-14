import { Request, Response } from 'express';
import {
  createReservation,
  listReservations,
  cancelReservation,
} from '../services/reservation.service';

export const listReservationsController = async (req: Request, res: Response) => {
  const reservations = await listReservations(req.user!.id);
  res.json({ reservations });
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

