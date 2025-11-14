import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import type { Floorplan } from '../types';

interface PendingReservation {
  floorplanId: string;
  tableId: string;
  tableLabel: string;
}

const defaultDate = new Date().toISOString().split('T')[0];

export const FloorplanPage = () => {
  const { t } = useTranslation();
  const [floorplans, setFloorplans] = useState<Floorplan[]>([]);
  const [selected, setSelected] = useState<PendingReservation | null>(null);
  const [form, setForm] = useState({ date: defaultDate, timeSlot: '19:00', guests: 2 });
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const fetchFloorplans = async () => {
      const { data } = await api.get('/floorplans');
      setFloorplans(data.floorplans);
    };
    void fetchFloorplans();
  }, []);

  const handleReserve = async () => {
    if (!selected) return;
    try {
      await api.post('/reservations', {
        floorplanId: selected.floorplanId,
        tableId: selected.tableId,
        date: form.date,
        timeSlot: form.timeSlot,
        guests: form.guests,
      });
      setFeedback(t('floorplan.reservationSuccess'));
      setSelected(null);
    } catch {
      setFeedback('Reservation failed. Try another slot.');
    }
  };

  return (
    <div className="flex h-full flex-col gap-6 overflow-hidden">
      <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl">
        <p className="text-sm uppercase tracking-wide text-slate-300">{t('floorplan.heading')}</p>
        <h2 className="mt-4 text-3xl font-semibold">
          Visualize every section and table in a swipe.
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          Tap on an available table to start a reservation. Coordinates map to mocked third-party
          floorplans which can be replaced via the backend proxy.
        </p>
      </div>
      <div className="flex-1 overflow-hidden rounded-3xl bg-white/5 p-4 shadow-lg">
        <Swiper className="h-full rounded-2xl bg-white p-6 shadow-lg">
        {floorplans.map((floorplan) => (
          <SwiperSlide key={floorplan.id} className="h-full">
            <div className="grid h-full gap-6 md:grid-cols-[2fr_1fr]">
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold text-slate-900">{floorplan.name}</h3>
                <div className="relative mt-6 flex-1 rounded-3xl border border-slate-200 bg-slate-50">
                  {floorplan.tables.map((table) => (
                    <button
                      key={table.id}
                      onClick={() =>
                        setSelected({
                          floorplanId: floorplan.id,
                          tableId: table.id,
                          tableLabel: table.label,
                        })
                      }
                      disabled={table.status === 'reserved'}
                      className={`absolute flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border text-sm font-semibold shadow transition ${
                        table.status === 'reserved'
                          ? 'border-rose-200 bg-rose-100 text-rose-600'
                          : 'border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50'
                      }`}
                      style={{ left: `${table.x}%`, top: `${table.y}%` }}
                    >
                      {table.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <h4 className="font-semibold text-slate-900">{t('floorplan.reserve')}</h4>
                {selected ? (
                  <>
                    <p className="text-sm text-slate-500">
                      {floorplan.name} · {selected.tableLabel}
                    </p>
                    <input
                      type="date"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2"
                      value={form.date}
                      onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                    />
                    <input
                      type="time"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2"
                      value={form.timeSlot}
                      onChange={(e) => setForm((prev) => ({ ...prev, timeSlot: e.target.value }))}
                    />
                    <input
                      type="number"
                      min={1}
                      max={10}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2"
                      value={form.guests}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, guests: Number(e.target.value) }))
                      }
                    />
                    <button
                      onClick={handleReserve}
                      className="w-full rounded-2xl bg-slate-900 py-3 text-white shadow hover:bg-slate-800"
                    >
                      {t('floorplan.reserveCta')}
                    </button>
                    <button
                      onClick={() => setSelected(null)}
                      className="w-full rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-600"
                    >
                      {t('common.cancel')}
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">
                    Tap on a free table to start a reservation.
                  </p>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
        </Swiper>
      </div>
      {feedback && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          {feedback}
        </div>
      )}
    </div>
  );
};

