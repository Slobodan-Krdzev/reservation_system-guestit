import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { api, getAvatarUrl } from "../services/api";
import { useAuthStore } from "../store/auth";
import type { FavoriteReservation, Reservation } from "../types";
import { ReservationCard } from "../components/reservations/ReservationCard";
import { useLocation, useNavigate } from "react-router-dom";

type UpgradeStep = "choose" | "payment" | "success";

const initialPaymentForm = {
  nameOnCard: "",
  cardNumber: "",
  expiry: "",
  cvc: "",
};

export const AccountPage = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [topFavorites, setTopFavorites] = useState<FavoriteReservation[]>([]);
  const [tierModalOpen, setTierModalOpen] = useState(false);
  const [upgradeStep, setUpgradeStep] = useState<UpgradeStep>("choose");
  const [paymentForm, setPaymentForm] = useState(initialPaymentForm);
  const [paymentStatus, setPaymentStatus] = useState<{ loading: boolean; error?: string; message?: string }>({
    loading: false,
  });

  const loadReservations = useCallback(async () => {
    if (!user) {
      setReservations([]);
      setTopFavorites([]);
      return;
    }
    const { data } = await api.get("/reservations");
    setReservations((data.reservations as Reservation[]) ?? []);
    setTopFavorites((data.favorites as FavoriteReservation[]) ?? []);
  }, [user]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void loadReservations();
    });
    return () => cancelAnimationFrame(frame);
  }, [loadReservations]);

  useEffect(() => {
    const state = location.state as { openTierModal?: boolean } | null;
    if (!state?.openTierModal) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      setTierModalOpen(true);
      setUpgradeStep("choose");
      setPaymentForm(initialPaymentForm);
      setPaymentStatus({ loading: false });
      navigate(location.pathname, { replace: true, state: null });
    });
    return () => cancelAnimationFrame(frame);
  }, [location.state, location.pathname, navigate]);

  const handleActivateSubscription = () => {
    setTierModalOpen(true);
    setUpgradeStep("choose");
    setPaymentStatus({ loading: false });
    setPaymentForm(initialPaymentForm);
  };

  const handleCloseModal = () => {
    setTierModalOpen(false);
    setUpgradeStep("choose");
    setPaymentForm(initialPaymentForm);
    setPaymentStatus({ loading: false });
  };

  const [statusFilter, setStatusFilter] = useState<Reservation["status"]>("pending");

  const handleCancelReservation = async (id: string) => {
    await api.delete(`/reservations/${id}`);
    await loadReservations();
  };

  const filteredReservations = useMemo(
    () => reservations.filter((reservation) => reservation.status === statusFilter),
    [reservations, statusFilter],
  );

  if (!user) {
    return null;
  }

  const isGoldMember = user.subscription.tier === "premium" && user.subscription.status === "active";
  const subscriptionLabel = isGoldMember ? "GOLD - Active" : "FREE - Active";
  const actionButtonLabel = isGoldMember ? "Manage membership" : "Unlock premium seats";

  const handlePaymentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!paymentForm.nameOnCard || !paymentForm.cardNumber || !paymentForm.expiry || !paymentForm.cvc) {
      setPaymentStatus({ loading: false, error: "Please complete all payment fields." });
      return;
    }
    setPaymentStatus({ loading: true });
    try {
      const { data } = await api.post("/subscription/activate", {
        cardHolder: paymentForm.nameOnCard,
        cardNumber: paymentForm.cardNumber.replace(/\s+/g, ""),
        expiry: paymentForm.expiry,
        cvc: paymentForm.cvc,
      });
      updateUser({ ...user, subscription: data.subscription });
      await loadReservations();
      setPaymentStatus({ loading: false, message: "Welcome to Gold!" });
      setUpgradeStep("success");
      setTimeout(() => {
        handleCloseModal();
      }, 1800);
    } catch (error) {
      setPaymentStatus({
        loading: false,
        error: error instanceof Error ? error.message : "Payment failed. Please try again.",
      });
    }
  };

  return (
    <>
      <div className="flex h-full w-full flex-col gap-4 overflow-hidden rounded-3xl bg-[#292929]/80 p-4 sm:gap-6 sm:p-6 lg:flex-row">
        <section className="hidden lg:flex w-full flex-shrink-0 flex-col rounded-3xl border border-white/10 bg-black/80 p-4 text-white shadow-[0_30px_80px_rgba(0,0,0,0.4)] sm:p-6 lg:w-[360px]">
          <div className="flex items-center gap-3">
            <div className="flex relative">
              <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-white/30 shadow-lg shadow-black/50">
                <img
                  src={
                    getAvatarUrl(user.avatarUrl) ||
                    `https://ui-avatars.com/api/?background=1E1E21&color=FDFDFD&name=${user.firstName}+${user.lastName}`
                  }
                  alt="avatar"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?background=1E1E21&color=FDFDFD&name=${user.firstName}+${user.lastName}`;
                  }}
                />
                <div className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 border border-white/30">
                  <svg
                    className="h-3.5 w-3.5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <p
                className={`text-xs uppercase tracking-[0.4em] ${
                  user.subscription.tier === 'premium' && user.subscription.status === 'active'
                    ? 'text-[#c3a35a]'
                    : 'text-white/50'
                }`}
              >
                {user.subscription.tier === 'premium' && user.subscription.status === 'active'
                  ? 'Gold member'
                  : 'Member'}
              </p>
              <p className="text-xl font-semibold">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-white/50">{t("account.heading")}</p>
            </div>
          </div>

          {topFavorites.length > 0 && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Book Again</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-1">
              {topFavorites.slice(0, 1).map((favorite) => (
                <div key={favorite.tableId} className="rounded-2xl bg-black/40 p-4">
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span>{favorite.tableName || `Table ${favorite.tableId}`}</span>
                    <span className="text-xs uppercase tracking-[0.3em] text-white/50">
                      {favorite.count}x
                    </span>
                  </div>
                  <p className="text-xs text-white/60">
                    Last: {favorite.lastDate} · {favorite.lastTime}
                  </p>
                  <button
                    onClick={() => {
                      navigate("/floorplan", { state: { quickBook: favorite } });
                    }}
                    className="mt-3 w-full rounded-xl border border-white/20 py-2 text-sm font-semibold hover:bg-white/10"
                  >
                    Book again
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
         
        <div className="mt-auto rounded-2xl border border-white/10 bg-gradient-to-r from-[#c3a35a] to-[#f1dd9b] p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            {t("common.subscription")}
          </p>
          <p className="mt-2 text-lg font-semibold">{subscriptionLabel}</p>
          <button
            onClick={handleActivateSubscription}
            className="mt-4 w-full rounded-2xl py-3 text-sm font-semibold text-black bg-white shadow-lg shadow-black/40"
          >
            {actionButtonLabel}
          </button>
        </div>

        
      </section>

      <section className="flex min-h-0 flex-1 flex-col rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a1a1d] to-[#0c0c0e] p-4 text-white shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">
              Active <br/> tables
            </p>
            <h2 className="hidden md:block text-2xl font-semibold mt-1">
              {t("account.reservations")}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-sm text-white/50">
              {filteredReservations.length} {statusFilter}
            </span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as Reservation["status"])}
              className="rounded-2xl border border-white/20 bg-white/5 px-3 py-2 text-sm uppercase tracking-[0.2em]"
            >
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="finished">Finished</option>
            </select>
          </div>
        </div>
        {filteredReservations.length ? (
          <div className="reservation-scroll mt-6 flex-1 w-full overflow-y-auto pr-2">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {filteredReservations.map((reservation) => (
                <ReservationCard
                  key={reservation._id}
                  reservation={reservation}
                  onCancel={handleCancelReservation}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-6 rounded-2xl border border-dashed border-white/20 bg-black/20 p-6 text-sm text-white/60">
            No reservations yet. Book your first table from the floorplan.
          </p>
        )}
      </section>
      </div>

    {tierModalOpen && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
        onClick={handleCloseModal}
      >
        <div
          className="w-full max-w-4xl rounded-3xl border border-white/10 bg-[#111113] p-6 text-white shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                Memberships
              </p>
              <h3 className="mt-1 text-2xl font-semibold">Choose your plan</h3>
            </div>
            <button
              onClick={handleCloseModal}
              className="rounded-full  p-2 hover:bg-white/20"
            >
              ✕
            </button>
          </div>
          {upgradeStep !== "payment" && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                    Free Member
                  </p>
                  <p className="mt-2 text-3xl font-bold">
                    €0<span className="text-sm font-medium">/month</span>
                  </p>
                </div>
                <ul className="flex-1 space-y-2 text-sm text-white/80">
                  <li>• Basic reservations</li>
                  <li>• Access to standard tables</li>
                </ul>
                <button
                  className={`mt-6 rounded-2xl border border-white/20 py-2 font-semibold ${
                    isGoldMember ? "text-white hover:bg-white/10" : "text-white/60 cursor-not-allowed"
                  }`}
                  disabled={!isGoldMember}
                >
                  {isGoldMember ? "Free plan" : "Current plan"}
                </button>
              </div>
              <div className="flex flex-col rounded-2xl border border-[#c3a35a] bg-gradient-to-r from-[#af9a6a] to-[#f1dd9b] p-5 shadow-xl shadow-[#f1dd9b]/25">
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-[0.4em] font-bold text-white">
                    Gold Member
                  </p>
                  <p className="mt-2 text-3xl font-bold">
                    €15<span className="text-sm font-medium">/month</span>
                  </p>
                </div>
                <ul className="flex-1 space-y-2 text-sm text-white/90">
                  <li>• Fast reservations</li>
                  <li>• Priority confirmation</li>
                  <li>• Premium table selection</li>
                  <li>• Exclusive discounts</li>
                </ul>
                <button
                  className={`mt-6 rounded-2xl bg-white py-2 font-semibold text-black transition ${
                    isGoldMember ? "cursor-not-allowed opacity-70" : "hover:bg-white/90"
                  }`}
                  disabled={isGoldMember}
                  onClick={() => {
                    if (isGoldMember) {
                      setUpgradeStep("success");
                      return;
                    }
                    setUpgradeStep("payment");
                    setPaymentStatus({ loading: false });
                  }}
                >
                  {isGoldMember ? "Already Gold" : "Upgrade to Gold"}
                </button>
              </div>
            </div>
          )}

          {upgradeStep === "payment" && (
            <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handlePaymentSubmit}>
              <div className="sm:col-span-2">
                <label className="text-xs uppercase tracking-[0.3em] text-white/60">Name on card</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 text-sm focus:border-white focus:outline-none"
                  value={paymentForm.nameOnCard}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, nameOnCard: e.target.value }))}
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-white/60">Card number</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 text-sm focus:border-white focus:outline-none"
                  value={paymentForm.cardNumber}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, cardNumber: e.target.value }))}
                  placeholder="4242 4242 4242 4242"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-white/60">Expiry</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 text-sm focus:border-white focus:outline-none"
                  value={paymentForm.expiry}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, expiry: e.target.value }))}
                  placeholder="MM/YY"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-white/60">CVC</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 text-sm focus:border-white focus:outline-none"
                  value={paymentForm.cvc}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, cvc: e.target.value }))}
                  placeholder="123"
                />
              </div>
              <div className="sm:col-span-2 flex flex-col gap-3">
                {paymentStatus.error && (
                  <p className="text-sm text-red-300">{paymentStatus.error}</p>
                )}
                {paymentStatus.message && (
                  <p className="text-sm text-emerald-300">{paymentStatus.message}</p>
                )}
                <button
                  type="submit"
                  disabled={paymentStatus.loading}
                  className="rounded-2xl bg-white py-3 font-semibold text-black hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {paymentStatus.loading ? "Processing..." : "Confirm upgrade"}
                </button>
              </div>
            </form>
          )}

          {upgradeStep === "success" && (
            <div className="mt-6 rounded-2xl border border-emerald-300/50 bg-emerald-900/30 px-4 py-3 text-center">
              <p className="text-sm text-emerald-100">You're officially a Gold member ✨</p>
            </div>
          )}
        </div>
      </div>
    )}
    </>
  );
};

// VERIFY LINK
// http://localhost:5026/api/auth/verify?token=YOUR_TOKEN_HERE