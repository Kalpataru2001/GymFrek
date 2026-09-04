import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import React from 'react';
interface StatCardProps { title:string; value:string|number; unit?:string; icon?:React.ReactNode; trend?:'up'|'down'|'neutral'; trendValue?:string; color?:'orange'|'green'|'blue'|'purple'; }
const colorMap={orange:{bg:'bg-orange-500/20',text:'text-orange-400'},green:{bg:'bg-green-500/20',text:'text-green-400'},blue:{bg:'bg-blue-500/20',text:'text-blue-400'},purple:{bg:'bg-purple-500/20',text:'text-purple-400'}};
const trendCfg={up:{Icon:TrendingUp,cls:'text-green-400'},down:{Icon:TrendingDown,cls:'text-red-400'},neutral:{Icon:Minus,cls:'text-gray-400'}};
const StatCard=({title,value,unit,icon,trend,trendValue,color='orange'}:StatCardProps)=>{
  const {bg,text}=colorMap[color];
  const t=trend?trendCfg[trend]:null;
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-3.5 sm:p-5 flex flex-col gap-3 sm:gap-4 overflow-hidden">
      <div className="flex items-start justify-between">
        {icon && <div className={cn('p-2 sm:p-2.5 rounded-lg',bg)}><span className={cn('flex items-center',text)}>{icon}</span></div>}
        {t&&trendValue&&<div className={cn('flex items-center gap-1 text-[11px] sm:text-xs font-semibold',t.cls)}><t.Icon className="w-3.5 h-3.5"/><span>{trendValue}</span></div>}
      </div>
      <div className="min-w-0">
        <p className="text-xs sm:text-sm text-gray-400 font-medium mb-0.5 sm:mb-1 truncate">{title}</p>
        <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
          <span className="text-xl sm:text-3xl font-bold text-white tabular-nums leading-tight">{value}</span>
          {unit&&<span className="text-xs sm:text-sm text-gray-400 font-normal">{unit}</span>}
        </div>
      </div>
    </div>
  );
};
export default StatCard;
