import { cn } from '@/lib/utils';

type Color = 'orange' | 'green' | 'blue' | 'red' | 'yellow';
type Height = 'sm' | 'md' | 'lg';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: Color;
  showLabel?: boolean;
  label?: string;
  height?: Height;
}

const colors: Record<Color, string> = {
  orange: 'bg-orange-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-400',
};

const heights: Record<Height, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const ProgressBar = ({
  value,
  max = 100,
  color = 'orange',
  showLabel = false,
  label,
  height = 'md',
}: ProgressBarProps) => {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  const widthStyle = { width: pct + '%' };

  return (
    <div className="w-full flex flex-col gap-1.5">
      {(label || showLabel) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="text-gray-300 font-medium">{label}</span>}
          {showLabel && (
            <span className="text-gray-400 tabular-nums ml-auto">{Math.round(pct)}%</span>
          )}
        </div>
      )}
      <div className={cn('w-full rounded-full bg-gray-700 overflow-hidden', heights[height])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', colors[color])}
          style={widthStyle}
        />
      </div>
    </div>
  );
};

export default ProgressBar;