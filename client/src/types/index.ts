export interface SubscriptionInfo {
  tier: 'free' | 'premium';
  status: 'inactive' | 'active' | 'past_due';
  expiresAt?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  subscription: SubscriptionInfo;
}

export interface Reservation {
  _id: string;
  floorplanId: string;
  tableId: string;
  date: string;
  timeSlot: string;
  guests: number;
  status: 'active' | 'cancelled' | 'completed';
}

export interface FloorTable {
  id: string;
  label: string;
  x: number;
  y: number;
  capacity: number;
  status: 'free' | 'reserved' | 'unavailable';
}

export interface FloorSection {
  id: string;
  name: string;
}

export interface Floorplan {
  id: string;
  name: string;
  sections: FloorSection[];
  tables: FloorTable[];
}

