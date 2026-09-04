'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LogOut, Bell, Menu, Dumbbell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, signOut } = useAuth();
  const { profile } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.replace('/');
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-gray-800 bg-gray-900 px-4 lg:px-6">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white lg:hidden transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Logo ONLY - Hidden on Desktop since Fixed Sidebar already displays the logo */}
      <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 shadow-sm shadow-orange-500/30">
          <Dumbbell className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold text-white">
          Gym<span className="text-orange-500">Frek</span>
        </span>
      </Link>

      {/* Desktop Left: Breadcrumb / Status (NO duplicate logo) */}
      <div className="hidden lg:flex items-center gap-2 text-sm text-gray-400">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-gray-400">{greeting()},</span>
        <span className="font-semibold text-white">
          {(profile?.displayName ?? user?.displayName ?? 'Champ').split(' ')[0]}
        </span>
        <span className="text-xs text-gray-500">&bull;</span>
        <span className="text-xs text-gray-400">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Right side greeting (mobile only or subtle) */}

        {/* Notifications placeholder */}
        <button
          className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-orange-500" />
        </button>

        {/* Avatar */}
        {user?.photoURL ? (
          <Image
            src={user.photoURL}
            alt={user.displayName ?? 'User'}
            width={32}
            height={32}
            className="rounded-full ring-2 ring-orange-500"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
            {(profile?.displayName ?? user?.email ?? 'U')[0].toUpperCase()}
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-white sm:flex"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </header>
  );
}
