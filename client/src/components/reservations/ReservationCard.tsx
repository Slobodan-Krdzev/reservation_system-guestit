import type { Reservation } from '../../types';

interface Props {
  reservation: Reservation;
  onCancel: (id: string) => void;
}

export const ReservationCard = ({ reservation, onCancel }: Props) => {
  const canCancel = reservation.status === 'active';
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-white shadow-inner shadow-black/40">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">
            {reservation.floorplanId} · {reservation.tableId}
          </p>
          <p className="text-xs text-white/60">
            {reservation.date} · {reservation.timeSlot} · {reservation.guests} guests
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            reservation.status === 'active'
              ? 'bg-emerald-400/20 text-emerald-200'
              : 'bg-white/10 text-white/60'
          }`}
        >
          {reservation.status}
        </span>
      </div>
      {canCancel && (
        <button
          onClick={() => onCancel(reservation._id)}
          className="mt-3 text-sm font-semibold text-rose-300 hover:text-rose-200"
        >
          Cancel reservation
        </button>
      )}
    </div>
  );
};

