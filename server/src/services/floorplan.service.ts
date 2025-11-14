import { sampleFloorplans } from '../data/floorplans';

export const getFloorplans = () => {
  return sampleFloorplans;
};

export const getFloorplanAvailability = (floorplanId: string) => {
  const floorplan = sampleFloorplans.find((fp) => fp.id === floorplanId);
  if (!floorplan) {
    return [];
  }
  return floorplan.tables.map((table) => ({
    tableId: table.id,
    status: Math.random() > 0.7 ? 'reserved' : 'free',
  }));
};

