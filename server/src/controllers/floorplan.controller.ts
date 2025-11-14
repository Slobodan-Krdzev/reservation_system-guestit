import { Request, Response } from 'express';
import { getFloorplans, getFloorplanAvailability } from '../services/floorplan.service';

export const listFloorplansController = (_req: Request, res: Response) => {
  res.json({ floorplans: getFloorplans() });
};

export const floorplanAvailabilityController = (req: Request, res: Response) => {
  res.json({
    floorplanId: req.params.id,
    availability: getFloorplanAvailability(req.params.id),
  });
};

