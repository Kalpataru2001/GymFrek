import { cn } from '@/lib/utils';
interface SpinnerProps { size?:'sm'|'md'|'lg'; color?:'orange'|'white'|'gray'; }
const sizes={sm:'h-4 w-4 border-2',md:'h-8 w-8 border-[3px]',lg:'h-12 w-12 border-4'};
const colors={orange:'border-orange-500 border-t-transparent',white:'border-white border-t-transparent',gray:'border-gray-400 border-t-transparent'};
const LoadingSpinner=({size='md',color='orange'}:SpinnerProps)=>(
  <div className="flex items-center justify-center" role="status">
    <div className={cn('rounded-full animate-spin',sizes[size],colors[color])}/>
    <span className="sr-only">Loading...</span>
  </div>
);
export default LoadingSpinner;
