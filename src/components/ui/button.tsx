'use client';

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-orange-500 hover:bg-orange-600 text-white border-transparent',
  secondary: 'bg-gray-700 hover:bg-gray-600 text-white border-transparent',
  ghost: 'bg-transparent hover:bg-gray-700 text-gray-200 border border-gray-600',
  danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent',
};

const sizeClasses: Record<Size, string> = {
  sm: 'py-1.5 px-3 text-sm rounded-lg',
  md: 'py-2 px-4 text-base rounded-lg',
  lg: 'py-3 px-6 text-lg rounded-xl',
};

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
  </svg>
);

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, disabled, className, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium border transition-colors duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant], sizeClasses[size], className
      )}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
);
Button.displayName = 'Button';
export default Button;
