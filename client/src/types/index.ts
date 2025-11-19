export interface SubscriptionInfo {
  tier: 'free' | 'premium';
  status: 'inactive' | 'active' | 'past_due';
  startedAt?: string;
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
  reservations?: string[];
}

export interface Reservation {
  _id: string;
  floorplanId: string;
  tableId: string;
  tableName?: string;
  date: string;
  timeSlot: string;
  guests: number;
  note?: string;
  status: 'pending' | 'active' | 'cancelled' | 'finished';
}

export interface AppNotification {
  _id: string;
  type: 'reservationApproved';
  message: string;
  reservationId?: string;
  createdAt: string;
}

export interface FavoriteReservation {
  tableId: string;
  tableName?: string;
  floorplanId: string;
  count: number;
  lastDate?: string;
  lastTime?: string;
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

