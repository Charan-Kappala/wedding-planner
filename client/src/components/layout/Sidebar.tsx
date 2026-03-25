import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Store,
  CheckSquare,
  Grid,
  Image,
  Settings,
  LogOut,
  X,
  LucideIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

const NAV_ITEMS: Array<{ to: string; label: string; icon: LucideIcon }> = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/guests', label: 'Guests', icon: Users },
  { to: '/budget', label: 'Budget', icon: DollarSign },
  { to: '/vendors', label: 'Vendors', icon: Store },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/seating', label: 'Seating', icon: Grid },
  { to: '/inspiration', label: 'Inspiration', icon: Image },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

function NavItem({ to, label, icon: Icon, onClick }: (typeof NAV_ITEMS)[0] & { onClick: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      aria-label={label}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-label font-semibold tracking-[0.08rem] uppercase transition-all duration-200
        ${isActive
          ? 'bg-surface-container-low text-primary'
          : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`} />
          {label}
        </>
      )}
    </NavLink>
  );
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    toast.success('Signed out.');
    navigate('/login');
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-on-surface/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-64 bg-surface-container-lowest editorial-shadow
          flex flex-col border-r border-outline-variant/15
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:shadow-none
        `}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex flex-col gap-0.5">
            <span className="font-headline italic text-xl tracking-tighter text-on-surface">
              Vows &amp; Plans
            </span>
            <span className="font-label text-[9px] uppercase tracking-[0.15rem] text-on-surface-variant">
              Wedding Atelier
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-6 h-px bg-outline-variant/20" />

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} {...item} onClick={onClose} />
          ))}
        </nav>

        {/* Bottom section */}
        <div className="mx-6 h-px bg-outline-variant/20" />
        <div className="px-3 py-4 space-y-0.5">
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-label font-semibold tracking-[0.08rem] uppercase transition-all duration-200
              ${isActive
                ? 'bg-surface-container-low text-primary'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`
            }
          >
            <Settings className="h-4 w-4" />
            Settings
          </NavLink>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-label font-semibold tracking-[0.08rem] uppercase text-on-surface-variant hover:bg-red-50 hover:text-error transition-all duration-200"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>

          {/* User pill */}
          {user && (
            <div className="mt-3 px-4 py-2.5 rounded-lg bg-surface-container-low">
              <p className="text-[10px] font-label uppercase tracking-[0.1rem] text-on-surface-variant truncate">
                {user.email}
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
