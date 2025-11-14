import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../services/api";
import { useAuthStore } from "../store/auth";
import type { Reservation } from "../types";
import { ReservationCard } from "../components/reservations/ReservationCard";

export const AccountPage = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuthStore();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchReservations = async () => {
    const { data } = await api.get("/reservations");
    setReservations(data.reservations);
  };

  useEffect(() => {
    if (!user) return;
    void fetchReservations();
  }, [user]);

  if (!user) {
    return null;
  }

  const handleProfileUpdate = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setBusy(true);
    const formData = new FormData(event.currentTarget);
    try {
      const { data } = await api.put("/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateUser(data.user);
      setMessage("Profile updated");
    } catch {
      setMessage("Failed to update profile");
    } finally {
      setBusy(false);
    }
  };

  const handleActivateSubscription = async () => {
    const { data } = await api.post("/subscription/activate");
    updateUser({ ...user, subscription: data.subscription });
  };

  const handleCancelReservation = async (id: string) => {
    await api.delete(`/reservations/${id}`);
    await fetchReservations();
  };

  const primaryReservation = reservations[0];

  return (
    <div className="grid h-full w-full gap-6 rounded-3xl bg-[#292929] p-6 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr]">
      <section className="flex h-full flex-col rounded-3xl border border-white/10 bg-black/80 p-6 text-white shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
        <form className="flex h-full flex-col gap-4" onSubmit={handleProfileUpdate}>
          <div className="flex items-center gap-3">
            <div className="flex relative">
              <label
                htmlFor="avatar-input"
                className="relative h-20 w-20 cursor-pointer overflow-hidden rounded-full  border-2 border-white/30 shadow-lg shadow-black/50 transition hover:scale-105"
              >
                <img
                  src={
                    user.avatarUrl ||
                    `https://ui-avatars.com/api/?background=1E1E21&color=FDFDFD&name=${user.firstName}+${user.lastName}`
                  }
                  alt="avatar"
                  className="h-full w-full object-cover "
                />
              </label>

              <label htmlFor="avatar-input" className="cursor-pointer hover:scale-105 transition-all duration-300 absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-black shadow-lg">
                ✎
              </label>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                Gold member
              </p>
              <p className="text-xl font-semibold">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-white/50">{t("account.heading")}</p>
            </div>
          </div>
          <input id="avatar-input" name="avatar" type="file" accept="image/*" className="hidden " />
          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {(
              [
                { label: t("auth.firstName"), name: "firstName", value: user.firstName },
                { label: t("auth.lastName"), name: "lastName", value: user.lastName },
                { label: t("auth.phone"), name: "phone", value: user.phone },
              ] as const
            ).map((input) => (
              <div key={input.name}>
                <label className="text-xs uppercase tracking-[0.3em] text-white/50">
                  {input.label}
                </label>
                <input
                  name={input.name}
                  defaultValue={input.value}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-[#2a2a2a] px-4 py-3 text-white focus:border-white/40 focus:outline-none"
                />
              </div>
            ))}
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-2xl bg-white py-3 text-black font-semibold shadow-lg shadow-black/40 hover:bg-neutral-200"
          >
            {busy ? "..." : t("common.save")}
          </button>
        </form>
        <div className="mt-4 rounded-2xl border border-white/10 bg-gradient-to-r from-[#c3a35a] to-[#f1dd9b] p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            {t("common.subscription")}
          </p>
          <p className="mt-2 text-lg font-semibold">
            {user.subscription.tier.toUpperCase()} · {user.subscription.status}
          </p>
          <button
            onClick={handleActivateSubscription}
            className="mt-4 w-full rounded-2xl  py-3 text-sm font-semibold text-black bg-white shadow-lg shadow-black/40"
          >
            Unlock premium seats
          </button>
        </div>
        {message && <p className="mt-4 text-sm text-white/60">{message}</p>}
      </section>

      <section className="flex h-full flex-col rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a1a1d] to-[#0c0c0e] p-6 text-white shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">
              Active tables
            </p>
            <h2 className="text-2xl font-semibold mt-1">
              {t("account.reservations")}
            </h2>
          </div>
          <span className="text-sm text-white/50">
            {reservations.length} active
          </span>
        </div>
        {primaryReservation ? (
          <div className="mt-6 rounded-3xl bg-black/30 p-6 text-white">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">
              You selected
            </p>
            <h3 className="mt-2 text-3xl font-semibold">
              Table {primaryReservation.tableId}
            </h3>
            <p className="mt-2 text-sm text-white/60">
              {primaryReservation.date} · {primaryReservation.timeSlot}
            </p>
            <div className="mt-4 flex gap-4">
              <div className="flex-1 rounded-2xl bg-white/5 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                  Guests
                </p>
                <p className="text-2xl font-semibold">
                  {primaryReservation.guests}
                </p>
              </div>
              <div className="flex-1 rounded-2xl bg-white/5 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                  Status
                </p>
                <p className="text-lg font-semibold capitalize">
                  {primaryReservation.status}
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                void handleCancelReservation(primaryReservation._id)
              }
              className="mt-6 w-full rounded-2xl border border-white/20 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Cancel reservation
            </button>
          </div>
        ) : (
          <p className="mt-6 rounded-2xl border border-dashed border-white/20 bg-black/20 p-6 text-sm text-white/60">
            No reservations yet. Book your first table from the floorplan.
          </p>
        )}
        <div className="mt-6 flex-1 overflow-y-auto space-y-4 pr-1">
          {reservations.slice(primaryReservation ? 1 : 0).map((reservation) => (
            <ReservationCard
              key={reservation._id}
              reservation={reservation}
              onCancel={handleCancelReservation}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
