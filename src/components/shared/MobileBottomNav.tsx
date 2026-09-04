'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  Dumbbell,
  Salad,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { label: 'Home', href: '/dashboard', Icon: LayoutDashboard },
  { label: 'Attendance', href: '/calendar', Icon: CalendarDays },
  { label: 'Workout', href: '/workout', Icon: Dumbbell },
  { label: 'Nutrition', href: '/nutrition', Icon: Salad },
  { label: 'Progress', href: '/progress', Icon: TrendingUp },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-30 h-16 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800/90 flex items-center justify-around px-2 lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {ITEMS.map(({ label, href, Icon }) => {
        const active =
          href === '/dashboard'
            ? pathname === '/dashboard'
            : href === '/nutrition'
            ? pathname === '/nutrition'
            : pathname === href || pathname.startsWith(href + '/');

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150',
              active
                ? 'text-orange-400 font-bold'
                : 'text-gray-400 hover:text-gray-200'
            )}
          >
            <div className="relative">
              <Icon
                className={cn(
                  'w-5 h-5 transition-transform',
                  active ? 'scale-110 text-orange-400' : 'text-gray-400'
                )}
              />
              {active && (
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500" />
              )}
            </div>
            <span
              className={cn(
                'text-[10px] tracking-tight mt-1 transition-colors leading-none',
                active ? 'text-orange-400 font-semibold' : 'text-gray-400'
              )}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
