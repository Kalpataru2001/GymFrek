import { cn } from '@/lib/utils';
import React from 'react';

interface CardProps { children: React.ReactNode; className?: string; hover?: boolean; }

const Card = ({ children, className, hover = false }: CardProps) => (
  <div className={cn('bg-gray-800 rounded-xl border border-gray-700 p-6', hover && 'transition-transform duration-200 hover:-translate-y-1 hover:border-gray-600 hover:shadow-lg hover:shadow-black/40 cursor-pointer', className)}>
    {children}
  </div>
);
export default Card;
