import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';
import React from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string; icon?: React.ReactNode; }

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, icon, className, id, ...props }, ref) => {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label htmlFor={inputId} className="text-sm font-medium text-gray-300">{label}</label>}
      <div className="relative flex items-center">
        {icon && <span className="absolute left-3 text-gray-400 pointer-events-none">{icon}</span>}
        <input ref={ref} id={inputId}
          className={cn('w-full rounded-lg bg-gray-700 border text-white placeholder-gray-400 py-2 px-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500', error ? 'border-red-500' : 'border-gray-600', icon ? 'pl-10' : 'pl-4', 'disabled:opacity-50', className)}
          {...props}/>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';
export default Input;
