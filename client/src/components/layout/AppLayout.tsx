import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "./LanguageSelector";
import { useAuthStore } from "../../store/auth";
import type { User, AppNotification } from "../../types";
import { api, getAvatarUrl } from "../../services/api";

export const AppLayout = () => {
  const { logout, user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [now, setNow] = useState(() => new Date());
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [notification, setNotification] = useState<AppNotification | null>(null);
  const [hasNotification, setHasNotification] = useState(false);
  const [reservationRefreshTick, setReservationRefreshTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Poll notifications every 15 seconds
  useEffect(() => {
    if (!user) {
      setNotification(null);
      setHasNotification(false);
      return;
    }

    let cancelled = false;
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get("/notifications");
        if (cancelled) return;
        const notifications = (data.notifications as AppNotification[]) ?? [];
        if (notifications.length) {
          const first = notifications[0];
          setNotification(first);
          setHasNotification(true);
          setReservationRefreshTick((prev) => prev + 1);
        } else {
          setNotification(null);
          setHasNotification(false);
        }
      } catch {
        if (!cancelled) {
          setNotification(null);
          setHasNotification(false);
        }
      }
    };

    // fetch immediately, then on interval
    void fetchNotifications();
    const intervalId = setInterval(() => {
      void fetchNotifications();
    }, 15_000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [user]);

  const { timeLabel, dateLabel, greeting } = useMemo(() => {
    const timeLabel = now.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
    const dateLabel = now.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const hour = now.getHours();
    const greeting =
      hour < 12 ? "Good Morning" : hour < 18 ? "Good Day" : "Good Night";
    return { timeLabel, dateLabel, greeting };
  }, [now]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden text-white">
      <header className="flex-shrink-0  bg-gradient-to-b from-black/80 via-black/70 to-transparent">
        <div className="flex w-full flex-wrap items-center justify-between gap-6 px-6 py-3">
          <div className="flex items-center gap-3">
            <img src="/client.png" alt="Venue logo" className="h-10 w-auto" />
          </div>
          <div className="text-center hidden sm:block">
            <p className="text-3xl font-semibold">{timeLabel}</p>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">
              {dateLabel}
            </p>
          </div>
          <UserMenu
            user={user}
            greeting={greeting}
            onLogout={logout}
            onEditProfile={() => {
              if (location.pathname === "/account") {
                setProfileModalOpen(true);
              } else {
                navigate("/account");
              }
            }}
            onManageSubscription={() => setSubscriptionModalOpen(true)}
            onAccountNavigate={() => navigate("/account")}
            isOnAccount={location.pathname === "/account"}
            hasNotification={hasNotification}
            notificationMessage={notification?.message}
            onNotificationSeen={() => setHasNotification(false)}
          />
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <div className="h-full w-full px-6 pb-6">
          <div className="h-full w-full overflow-hidden rounded-3xl border border-white/5 bg-black/30 backdrop-blur">
            <Outlet context={{ reservationRefreshTick }} />
          </div>
        </div>
      </main>
      <footer className="flex-shrink-0 border-t border-white/10 bg-black/90">
        <div className="flex w-full items-center justify-between px-6 py-4 text-white/80">
          {location.pathname === "/account" ? (
            <button
              onClick={() => navigate(-1)}
              className="text-sm font-semibold hover:text-white"
            >
              ← Back
            </button>
          ) : (
            <img src="/guestit.png" alt="guestit" className="h-6" />
          )}
          <LanguageSelector />
        </div>
      </footer>
      {profileModalOpen && user && (
        <ProfileModal user={user} onClose={() => setProfileModalOpen(false)} />
      )}
      {subscriptionModalOpen && user && (
        <SubscriptionModal
          user={user}
          onClose={() => setSubscriptionModalOpen(false)}
          onNavigateAccount={(options) => {
            setSubscriptionModalOpen(false);
            if (options?.openTierModal) {
              navigate("/account", { state: { openTierModal: true } });
            } else {
              navigate("/account");
            }
          }}
        />
      )}
    </div>
  );
};

interface UserMenuProps {
  user: User | null;
  greeting: string;
  onLogout: () => void;
  onEditProfile: () => void;
  onManageSubscription: () => void;
  onAccountNavigate: () => void;
  isOnAccount: boolean;
  hasNotification: boolean;
  notificationMessage?: string;
  onNotificationSeen?: () => void;
}

const UserMenu = ({
  user,
  greeting,
  onLogout,
  onEditProfile,
  onManageSubscription,
  onAccountNavigate,
  isOnAccount,
  hasNotification,
  notificationMessage,
  onNotificationSeen,
}: UserMenuProps) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const toggle = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!open && hasNotification && onNotificationSeen) {
      onNotificationSeen();
    }
    setOpen((prev) => !prev);
  };

  return (
    <div className="relative flex items-center gap-3">
      <div className="text-right">
        <p className="text-[0.8rem] tracking-tight text-white/60">{greeting}</p>
        <p className="text-sm font-semibold">
          {user ? `${user.firstName} ${user.lastName}` : "Guest User"}
        </p>
      </div>
      <div className="flex items-center gap-2 relative cursor-pointer">
        {hasNotification && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[0.6rem] font-bold text-white shadow-[0_0_10px_rgba(248,113,113,0.9)]">
            !
          </span>
        )}
        <span
          onClick={toggle}
          className={`absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-black/70 text-[15px] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
        <button
          onClick={toggle}
          className="h-10 w-10 overflow-hidden rounded-full bg-white/10 transition hover:ring-2 hover:ring-white/40"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          {user && getAvatarUrl(user.avatarUrl) ? (
            <img
              src={getAvatarUrl(user.avatarUrl) || ''}
              alt="avatar"
              className="h-full w-full object-cover"
              onError={(e) => {
                // Fallback to initials if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent && user) {
                  const fallback = document.createElement('span');
                  fallback.className = 'flex h-full w-full items-center justify-center text-sm font-semibold';
                  fallback.textContent = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
                  parent.appendChild(fallback);
                }
              }}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-sm font-semibold">
              {user
                ? `${user.firstName.charAt(0)}${user.lastName.charAt(
                    0
                  )}`.toUpperCase()
                : "GU"}
            </span>
          )}
        </button>
      </div>
      {open && (
        <div
          className="absolute right-0 top-14 z-30 w-64 rounded-2xl border border-white/10 bg-black/90 p-4 text-sm shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            Profile
          </p>
          <p className="mt-1 font-semibold">
            {user ? `${user.firstName} ${user.lastName}` : "Guest User"}
          </p>
          <p className="text-xs text-white/60">{user?.email}</p>
          <p className="text-xs text-white/60">{user?.phone}</p>
          {notificationMessage && (
            <div className="mt-3 rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs text-red-100">
              {notificationMessage}
            </div>
          )}
          <div className="mt-4 space-y-2">
            <button
              onClick={() => {
                if (isOnAccount) {
                  onEditProfile();
                } else {
                  onAccountNavigate();
                }
                setOpen(false);
              }}
              className="block w-full rounded-xl border border-white/20 px-4 py-2 text-center font-semibold text-white hover:bg-white/10"
            >
              {isOnAccount ? "Edit personal info" : "Account"}
            </button>
            <button
              onClick={() => {
                onManageSubscription();
                setOpen(false);
              }}
              className="block w-full rounded-xl bg-white px-4 py-2 text-center font-semibold text-black"
            >
              Manage subscription
            </button>
            <button
              onClick={onLogout}
              className="block w-full rounded-xl border border-red-300 px-4 py-2 text-center font-semibold text-red-300 hover:bg-red-500/10"
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileModal = ({
  user,
  onClose,
}: {
  user: User;
  onClose: () => void;
}) => {
  const { updateUser } = useAuthStore();
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const editableFields: Array<keyof Pick<User, "firstName" | "lastName" | "phone">> = [
    "firstName",
    "lastName",
    "phone",
  ];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const formData = new FormData(event.currentTarget);
    try {
      const { data } = await api.put("/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateUser(data.user);
      setMessage("Profile updated successfully!");
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Failed to update profile:", error);
      setMessage("Failed to update profile. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-black/90 p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t("account.heading")}</h3>
          <button onClick={onClose}>✕</button>
        </div>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          {editableFields.map((field) => (
            <div key={field}>
              <label className="text-xs uppercase tracking-[0.3em] text-white/50">
                {t(`auth.${field}` as const)}
              </label>
              <input
                name={field}
                defaultValue={user[field]}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white"
              />
            </div>
          ))}
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-white/50">
              {t("auth.avatar")}
            </label>
            <input
              type="file"
              name="avatar"
              accept="image/*"
              className="mt-1 w-full text-white"
            />
          </div>
          {message && <p className="text-sm text-white/70">{message}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/30 px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black"
            >
              {busy ? "Saving..." : t("common.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SubscriptionModal = ({
  user,
  onClose,
  onNavigateAccount,
}: {
  user: User;
  onClose: () => void;
  onNavigateAccount: (options?: { openTierModal?: boolean }) => void;
}) => {
  const { updateUser } = useAuthStore();
  const [processing, setProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const isGoldMember = user.subscription.tier === "premium" && user.subscription.status === "active";
  const memberSince = user.subscription.startedAt
    ? new Date(user.subscription.startedAt).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;
  const expiresLabel = user.subscription.expiresAt
    ? new Date(user.subscription.expiresAt).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;
  const cardClasses = isGoldMember
    ? "rounded-[32px] border border-[#c3a35a]/50 bg-gradient-to-br from-[#f8e8b1] via-[#f0d78c] to-[#c69b4e] p-6 text-[#1f1606] shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
    : "rounded-[32px] border border-white/20 bg-[#0f0f10]/95 p-6 text-white shadow-[0_25px_60px_rgba(0,0,0,0.55)]";
  const accentText = isGoldMember ? "text-[#7a5b19]" : "text-white/60";
  const statBorder = isGoldMember ? "border-[#d4b162]/70 bg-white/20 text-[#1f1606]" : "border-white/20 bg-white/5 text-white";
  const statLabel = isGoldMember ? "text-[#7a5b19]" : "text-white/50";
  const statValue = isGoldMember ? "text-[#1f1606]" : "text-white";

  const handleCancel = async () => {
    setProcessing(true);
    setFeedback(null);
    try {
      const { data } = await api.post("/subscription/cancel");
      updateUser({ ...user, subscription: data.subscription });
      setFeedback("Subscription cancelled. Reverting to Free tier.");
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch {
      setFeedback("Failed to cancel subscription. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur">
      <div className="w-full max-w-lg space-y-5">
        <div className={cardClasses}>
          <div className={`flex items-center justify-between text-xs uppercase tracking-[0.4em] ${accentText}`}>
            <span>{isGoldMember ? "Gold Member" : "Free Member"}</span>
            <span>{user.subscription.status}</span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-semibold">{user.firstName} {user.lastName}</p>
            <p className={`text-sm ${isGoldMember ? "text-[#5d4213]" : "text-white/70"}`}>{user.email}</p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className={`rounded-2xl border px-4 py-3 backdrop-blur ${statBorder}`}>
              <p className={`text-[0.7rem] uppercase tracking-[0.35em] ${statLabel}`}>Member since</p>
              <p className={`mt-2 text-lg font-semibold ${statValue}`}>
                {memberSince || "—"}
              </p>
            </div>
            <div className={`rounded-2xl border px-4 py-3 backdrop-blur ${statBorder}`}>
              <p className={`text-[0.7rem] uppercase tracking-[0.35em] ${statLabel}`}>Expires</p>
              <p className={`mt-2 text-lg font-semibold ${statValue}`}>
                {expiresLabel || "1 year after upgrade"}
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {!isGoldMember && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateAccount({ openTierModal: true });
                }}
                className="flex-1 rounded-2xl bg-white py-3 text-sm font-semibold text-black shadow-lg shadow-black/30"
              >
                Upgrade to Gold
              </button>
            )}
            {isGoldMember && (
              <button
                onClick={handleCancel}
                disabled={processing}
                className="flex-1 rounded-2xl border border-red-500/40 bg-red-500/15 py-3 text-sm font-semibold text-red-900 shadow-inner disabled:cursor-not-allowed disabled:opacity-70"
              >
                {processing ? "Cancelling..." : "Cancel subscription"}
              </button>
            )}
            <button
              onClick={onClose}
              className={`flex-1 rounded-2xl border py-3 text-sm font-semibold ${
                isGoldMember ? "border-[#1f1606]/30 bg-white/20 text-[#1f1606]" : "border-white/20 bg-white/5 text-white"
              }`}
            >
              Close
            </button>
          </div>
          {feedback && (
            <p className={`text-center text-sm font-semibold ${isGoldMember ? "text-[#6a4b16]" : "text-white/70"}`}>
              {feedback}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
