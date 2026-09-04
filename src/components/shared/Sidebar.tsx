'use client';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Dumbbell,
  Salad,
  Calculator,
  TrendingUp,
  ListChecks,
  UserCircle2,
  CalendarDays,
  X,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const NAV = [
  { label: 'Dashboard', href: '/dashboard', Icon: LayoutDashboard },
  { label: 'Attendance & Logs', href: '/calendar', Icon: CalendarDays },
  { label: 'Workout', href: '/workout', Icon: Dumbbell },
  { label: 'Nutrition', href: '/nutrition', Icon: Salad },
  { label: 'Food Calculator', href: '/nutrition/food-calculator', Icon: Calculator },
  { label: 'Progress', href: '/progress', Icon: TrendingUp },
  { label: 'Exercises', href: '/exercises', Icon: ListChecks },
  { label: 'Profile', href: '/profile', Icon: UserCircle2 },
];

const initials = (name?: string | null, email?: string | null) => {
  if (name) return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  if (email) return email[0].toUpperCase();
  return 'U';
};

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { profile } = useUser();

  const handleLogout = async () => {
    onClose?.();
    await signOut();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      />

      {/* Permanently Fixed Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen w-64 bg-gray-900 border-r border-gray-800/90 flex flex-col transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header: The One & Only GymFrek Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-800/80 bg-gray-900/60 flex-shrink-0">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3 group transition-transform active:scale-95"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 shadow-md shadow-orange-500/25 group-hover:scale-105 transition-all">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-white leading-none">
                Gym<span className="text-orange-500">Frek</span>
              </span>
              <span className="text-[10px] font-bold text-orange-400/90 tracking-wider uppercase mt-0.5">
                Fitness OS
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 lg:hidden transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Label */}
        <div className="px-5 pt-4 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400/70 flex-shrink-0">
          Navigation
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto py-1 px-3 space-y-1">
          <ul className="space-y-1">
            {NAV.map(({ label, href, Icon }) => {
              const active =
                href === '/nutrition'
                  ? pathname === '/nutrition'
                  : href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname === href || pathname.startsWith(href + '/');

              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onClose}
                    className={cn(
                      'group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                      active
                        ? 'text-orange-400 bg-orange-500/15 font-semibold border-l-2 border-orange-500'
                        : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/70'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={cn(
                          'w-5 h-5 flex-shrink-0 transition-colors',
                          active
                            ? 'text-orange-400'
                            : 'text-gray-400 group-hover:text-gray-200'
                        )}
                      />
                      <span className="truncate">{label}</span>
                    </div>

                    {active ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 group-hover:text-gray-400 transition-all flex-shrink-0" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile Card at Bottom */}
        <div className="border-t border-gray-800/80 p-3.5 bg-gray-900/60 flex-shrink-0">
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-gray-800/40 hover:bg-gray-800/70 transition-colors">
            <Link
              href="/profile"
              onClick={onClose}
              className="flex items-center gap-2.5 min-w-0 flex-1 group"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm shadow-sm ring-1 ring-orange-500/30 group-hover:ring-orange-500 transition-all">
                {initials(profile?.displayName || user?.displayName, user?.email)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate group-hover:text-orange-400 transition-colors">
                  {profile?.displayName || user?.displayName || 'Gym Member'}
                </p>
                <p className="text-[11px] text-gray-400 truncate">
                  {user?.email || 'Logged in'}
                </p>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

