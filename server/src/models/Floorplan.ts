import { Schema, model, type Document } from 'mongoose';

export interface IFloorTable {
  id: string;
  label: string;
  x: number;
  y: number;
  capacity: number;
  status: 'free' | 'reserved' | 'unavailable';
}

export interface IFloorSection {
  id: string;
  name: string;
}

export interface IFloorplan extends Document {
  externalId: string;
  name: string;
  sections: IFloorSection[];
  tables: IFloorTable[];
  updatedAt: Date;
}

const sectionSchema = new Schema<IFloorSection>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
  },
  { _id: false },
);

const tableSchema = new Schema<IFloorTable>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    capacity: { type: Number, required: true },
    status: { type: String, enum: ['free', 'reserved', 'unavailable'], default: 'free' },
  },
  { _id: false },
);

const floorplanSchema = new Schema<IFloorplan>(
  {
    externalId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    sections: [sectionSchema],
    tables: [tableSchema],
  },
  { timestamps: true },
);

export const Floorplan = model<IFloorplan>('Floorplan', floorplanSchema);

