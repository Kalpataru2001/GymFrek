'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { DailyLog } from '@/lib/types';
import {
  Bell,
  X,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Droplets,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  type: 'urgent' | 'info' | 'success';
  title: string;
  message: string;
  link?: string;
  linkText?: string;
  icon: any;
  timestamp: string;
}

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

function todayDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function NotificationsPanel({
  isOpen,
  onClose,
  onUnreadCountChange,
}: NotificationsPanelProps) {
  const { user } = useAuth();
  const { profile } = useUser();
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());

  // Load today's log for alerts
  useEffect(() => {
    if (!user) return;
    const today = todayDateStr();
    try {
      const cached = localStorage.getItem(`gymfrek_logs_${user.uid}`);
      if (cached) {
        const map = JSON.parse(cached) as Record<string, DailyLog>;
        if (map[today]) setTodayLog(map[today]);
      }
    } catch { /* */ }

    getDoc(doc(db, 'dailyLogs', `${user.uid}_${today}`)).then(snap => {
      if (snap.exists()) setTodayLog(snap.data() as DailyLog);
    }).catch(() => {});
  }, [user]);

  // Compute smart dynamic notifications
  const notifications: NotificationItem[] = useMemo(() => {
    const list: NotificationItem[] = [];
    const hour = new Date().getHours();
    const macros = profile?.macros;

    // 1. Attendance alert
    const attendance = todayLog?.attendance || 'none';
    if (attendance === 'none') {
      list.push({
        id: 'attendance_unmarked',
        type: hour >= 16 ? 'urgent' : 'info',
        title: 'Workout Attendance Unmarked',
        message: 'Remember to check in your workout or rest day on your calendar.',
        link: '/calendar',
        linkText: 'Check In Calendar',
        icon: Calendar,
        timestamp: 'Today',
      });
    } else if (attendance === 'completed') {
      list.push({
        id: 'attendance_completed',
        type: 'success',
        title: 'Workout Completed!',
        message: 'High five! Discipline is the bridge between goals and accomplishment.',
        icon: CheckCircle2,
        timestamp: 'Today',
      });
    }

    // 2. Nutrition alerts
    const kcal = todayLog?.totalCalories ?? 0;
    const targetKcal = macros?.calories ?? 2000;
    if (kcal === 0 && hour >= 13) {
      list.push({
        id: 'no_food_logged',
        type: 'urgent',
        title: 'No Meals Logged Yet',
        message: "You haven't logged any food today. Log your meals to track your daily growth score!",
        link: '/nutrition/food-calculator',
        linkText: 'Open Food Calculator',
        icon: Flame,
        timestamp: 'Today',
      });
    } else if (kcal > 0) {
      const pct = Math.round((kcal / targetKcal) * 100);
      list.push({
        id: 'food_progress',
        type: 'info',
        title: 'Nutrition Tracked',
        message: `You've logged ${kcal} kcal (${pct}% of your daily ${targetKcal} kcal budget).`,
        link: '/progress',
        linkText: 'View Daily Report',
        icon: Sparkles,
        timestamp: 'Today',
      });
    }

    // 3. Hydration alert
    const water = todayLog?.waterMl ?? 0;
    const waterTarget = macros?.water ?? 2500;
    if (water < waterTarget * 0.4 && hour >= 14) {
      list.push({
        id: 'water_reminder',
        type: 'info',
        title: 'Hydration Check 💧',
        message: `You have logged ${water} ml out of your ${waterTarget} ml goal. Drink a glass of water now!`,
        link: '/calendar',
        linkText: 'Log Water',
        icon: Droplets,
        timestamp: 'Today',
      });
    } else if (water >= waterTarget && waterTarget > 0) {
      list.push({
        id: 'water_goal_met',
        type: 'success',
        title: 'Hydration Target Reached!',
        message: `Great hydration habits! You reached your ${waterTarget} ml daily water goal.`,
        icon: Droplets,
        timestamp: 'Today',
      });
    }

    // 4. Exercise routine suggestion
    list.push({
      id: 'routine_check',
      type: 'info',
      title: '6-Day Workout Plan Ready',
      message: 'Explore your customized exercises, sets, reps & video tutorials in the Workout tab.',
      link: '/workout',
      linkText: 'Go to Workout Plan',
      icon: Sparkles,
      timestamp: 'Active',
    });

    return list;
  }, [todayLog, profile]);

  // Unread count
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !readIds.has(n.id)).length;
  }, [notifications, readIds]);

  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
  }, [unreadCount, onUnreadCountChange]);

  const markAllAsRead = () => {
    setReadIds(new Set(notifications.map(n => n.id)));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-over dropdown / drawer */}
      <div className="fixed top-16 right-2 sm:right-6 z-50 w-[94vw] max-w-sm rounded-2xl border border-gray-700 bg-gray-900/95 p-4 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-bold text-white">Notifications &amp; Activity</h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-[10px] font-bold text-orange-300 border border-orange-500/30">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] text-gray-400 hover:text-white transition-colors"
              >
                Mark all read
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
              aria-label="Close notifications"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="mt-3 space-y-2.5 max-h-[70vh] overflow-y-auto pr-1">
          {notifications.map(n => {
            const isRead = readIds.has(n.id);
            const Icon = n.icon;
            const badgeBg =
              n.type === 'urgent'
                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                : n.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-blue-500/20 text-blue-400 border-blue-500/30';

            return (
              <div
                key={n.id}
                className={`p-3 rounded-xl border transition-all ${
                  isRead
                    ? 'border-gray-800 bg-gray-850/50 opacity-70'
                    : 'border-gray-700 bg-gray-800/90 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className={`p-1.5 rounded-lg border flex-shrink-0 ${badgeBg}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-white truncate">{n.title}</p>
                      <span className="text-[10px] text-gray-500 flex-shrink-0">{n.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-gray-300 mt-1 leading-snug">{n.message}</p>
                    {n.link && (
                      <Link
                        href={n.link}
                        onClick={onClose}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-400 hover:text-orange-300 mt-2"
                      >
                        {n.linkText || 'View'}
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
