import { NavLink, useNavigate } from 'react-router-dom';
import {
  Heart,
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
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150
        ${isActive
          ? 'bg-blush-50 text-blush-500 font-semibold'
          : 'text-gray-500 hover:bg-blush-50 hover:text-blush-400'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-blush-400' : 'text-gray-400'}`} />
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
          className="fixed inset-0 z-30 bg-charcoal/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-64 bg-white shadow-warm-lg
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:shadow-none lg:border-r lg:border-blush-100
        `}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-blush-100">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-blush-400 fill-blush-300" />
            <span className="font-heading text-xl font-semibold text-charcoal">Vows & Plans</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden btn-ghost p-1 rounded-full"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} {...item} onClick={onClose} />
          ))}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-blush-100 px-3 py-4 space-y-1">
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150
              ${isActive ? 'bg-blush-50 text-blush-500' : 'text-gray-500 hover:bg-blush-50 hover:text-blush-400'}`
            }
          >
            <Settings className="h-5 w-5 text-gray-400" />
            Settings
          </NavLink>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors duration-150"
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </button>

          {/* User pill */}
          {user && (
            <div className="mt-2 px-3 py-2 rounded-xl bg-blush-50">
              <p className="text-xs font-semibold text-blush-400 truncate">{user.email}</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
