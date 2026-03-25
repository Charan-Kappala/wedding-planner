import React, { useState, useEffect } from 'react';
import { Menu, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useWeddingStore } from '../../store/weddingStore';

interface TopBarProps {
  onMenuClick: () => void;
}

function useCountdown(targetDate: string | null) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number } | null>(
    null,
  );

  useEffect(() => {
    if (!targetDate) return;

    function update() {
      const diff = new Date(targetDate!).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft({ days, hours, minutes });
    }

    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { user } = useAuthStore();
  const { wedding } = useWeddingStore();
  const countdown = useCountdown(wedding?.date ?? null);

  const weddingName =
    wedding?.partner1Name && wedding?.partner2Name
      ? `${wedding.partner1Name} & ${wedding.partner2Name}`
      : 'Your Wedding';

  return (
    <header className="sticky top-0 z-20 h-16 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/15 flex items-center px-6 gap-4">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Wedding name */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-headline italic text-lg text-on-surface truncate">
          {weddingName}
        </span>
      </div>

      {/* Countdown badge */}
      {countdown !== null && (
        <div className="hidden sm:flex items-center gap-1.5 gold-gradient rounded-full px-4 py-1.5 editorial-shadow">
          <span className="text-[10px] font-label font-semibold text-on-primary tracking-widest uppercase">
            {countdown.days > 0
              ? `${countdown.days}d ${countdown.hours}h to go`
              : countdown.hours > 0
                ? `${countdown.hours}h ${countdown.minutes}m to go`
                : "It's today!"}
          </span>
        </div>
      )}

      <div className="flex-1" />

      {/* Avatar */}
      <div className="flex items-center gap-2" aria-label={`Signed in as ${user?.email}`}>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-high editorial-shadow">
          <User className="h-4 w-4 text-on-surface-variant" />
        </div>
        <span className="hidden md:block text-[10px] font-label uppercase tracking-[0.1rem] text-on-surface-variant max-w-[140px] truncate">
          {user?.email}
        </span>
      </div>
    </header>
  );
}
