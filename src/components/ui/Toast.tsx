'use client';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
interface ToastProps { message:string; type:'success'|'error'|'info'; onClose:()=>void; }
const cfg={success:{bg:'bg-green-600',Icon:CheckCircle2},error:{bg:'bg-red-600',Icon:XCircle},info:{bg:'bg-blue-600',Icon:Info}};
const Toast=({message,type,onClose}:ToastProps)=>{
  const {bg,Icon}=cfg[type];
  useEffect(()=>{const t=setTimeout(onClose,3000);return()=>clearTimeout(t);},[onClose]);
  return(
    <div role="alert" className={cn('fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-xl px-4 py-3 shadow-2xl text-white min-w-[240px] max-w-sm',bg)}>
      <Icon className="w-5 h-5 flex-shrink-0"/>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button onClick={onClose} className="opacity-80 hover:opacity-100"><X className="w-4 h-4"/></button>
    </div>
  );
};
export default Toast;
