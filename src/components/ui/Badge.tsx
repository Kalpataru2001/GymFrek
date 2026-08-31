import { cn } from '@/lib/utils';
import React from 'react';
type BadgeVariant = 'orange'|'green'|'blue'|'yellow'|'red'|'purple'|'gray';
interface BadgeProps { children: React.ReactNode; variant?: BadgeVariant; className?: string; }
const v: Record<BadgeVariant,string> = {
  orange:'bg-orange-500/20 text-orange-400 ring-orange-500/30',
  green:'bg-green-500/20 text-green-400 ring-green-500/30',
  blue:'bg-blue-500/20 text-blue-400 ring-blue-500/30',
  yellow:'bg-yellow-500/20 text-yellow-400 ring-yellow-500/30',
  red:'bg-red-500/20 text-red-400 ring-red-500/30',
  purple:'bg-purple-500/20 text-purple-400 ring-purple-500/30',
  gray:'bg-gray-600/40 text-gray-300 ring-gray-500/30',
};
const Badge = ({ children, variant='gray', className }: BadgeProps) => (
  <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset', v[variant], className)}>{children}</span>
);
export default Badge;
