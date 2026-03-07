import React, { useState, useEffect } from 'react';
import { Menu, User, Heart } from 'lucide-react';
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
    <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur border-b border-blush-100 flex items-center px-4 gap-4">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden btn-ghost p-1.5 rounded-full"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Wedding name */}
      <div className="flex items-center gap-2 min-w-0">
        <Heart className="h-4 w-4 text-blush-300 fill-blush-200 flex-shrink-0" />
        <span className="font-heading text-lg font-semibold text-charcoal truncate">
          {weddingName}
        </span>
      </div>

      {/* Countdown badge */}
      {countdown !== null && (
        <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-champagne-300/20 border border-champagne-400/30 px-3 py-1">
          <span className="text-xs font-semibold text-champagne-500">
            {countdown.days > 0
              ? `${countdown.days}d ${countdown.hours}h to go`
              : countdown.hours > 0
                ? `${countdown.hours}h ${countdown.minutes}m to go`
                : "It's today! 🎊"}
          </span>
        </div>
      )}

      <div className="flex-1" />

      {/* Avatar */}
      <div className="flex items-center gap-2" aria-label={`Signed in as ${user?.email}`}>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blush-100 border border-blush-200">
          <User className="h-4 w-4 text-blush-400" />
        </div>
        <span className="hidden md:block text-xs text-gray-500 max-w-[140px] truncate">
          {user?.email}
        </span>
      </div>
    </header>
  );
}
