import { useState } from "react";
import type { Reservation } from "../../types";

interface Props {
  reservation: Reservation;
  onCancel: (id: string) => void;
}

export const ReservationCard = ({ reservation, onCancel }: Props) => {
  const canCancel = reservation.status === "active";
  const statusLabel =
    reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1);
  const hasNote = Boolean(reservation.note && reservation.note.trim().length);
  const [noteOpen, setNoteOpen] = useState(false);

  return (
    <div className="flex h-full flex-col rounded-[32px] bg-[#111113] p-6 text-white shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-2">
          {reservation.status !== "finished" && (
            <span
              className={`h-2 w-2 rounded-full ${
                reservation.status === "active"
                  ? "bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.9)]"
                  : reservation.status === "pending"
                  ? "bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.8)]"
                  : "bg-rose-400 shadow-[0_0_10px_rgba(248,113,113,0.8)]"
              }`}
            />
          )}
          <p className="text-xs uppercase tracking-[0.5em] text-white/50">
            {statusLabel} Reservation
          </p>
        </div>
        <h3 className="mt-2 text-3xl font-semibold">
          Table {reservation.tableName || reservation.tableId}
        </h3>
        <p className="mt-2 text-sm text-white/70">
          {reservation.date} · {reservation.timeSlot}
        </p>
        <div className="mt-3 text-left">
          {hasNote ? (
            <div>
              <button
                onClick={() => setNoteOpen((prev) => !prev)}
                className="text-xs uppercase tracking-[0.3em] text-white/60 underline-offset-4 hover:text-white/90"
              >
                {noteOpen ? "Hide note" : "Show note"}
              </button>
              {noteOpen && (
                <div className="mt-2 rounded-2xl bg-white/5 px-4 py-3 max-h-28 overflow-y-auto pr-2">
                  <p className="text-sm text-white/80 break-words whitespace-pre-wrap">
                    {reservation.note}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">No note</p>
          )}
        </div>
      </div>

        {!noteOpen && (
          <div className="mt-6 grid grid-cols-2 gap-4 text-center text-white">
            <div className="rounded-3xl bg-white/5 px-4 py-5">
              <p className="text-xs uppercase tracking-[0.4em] text-white/40">Guests</p>
              <p className="mt-2 text-2xl font-semibold">{reservation.guests}</p>
            </div>
            <div className="rounded-3xl bg-white/5 px-4 py-5">
              <p className="text-xs uppercase tracking-[0.4em] text-white/40">Status</p>
              <p className="mt-2 text-lg font-semibold capitalize">{statusLabel}</p>
            </div>
          </div>
        )}

      {canCancel && (
        <button
          onClick={() => onCancel(reservation._id)}
          className="mt-6 w-full rounded-2xl border border-white/30 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Cancel reservation
        </button>
      )}
    </div>
  );
};


