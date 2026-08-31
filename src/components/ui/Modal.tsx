'use client';
import { cn } from '@/lib/utils';
import { useEffect, useCallback, useRef } from 'react';
import { X } from 'lucide-react';
import React from 'react';
interface ModalProps { isOpen:boolean; onClose:()=>void; title:string; children:React.ReactNode; size?:'sm'|'md'|'lg'; }
const sizes={sm:'max-w-sm',md:'max-w-lg',lg:'max-w-2xl'};
const Modal=({isOpen,onClose,title,children,size='md'}:ModalProps)=>{
  const ref=useRef<HTMLDivElement>(null);
  const onKey=useCallback((e:KeyboardEvent)=>{if(e.key==='Escape')onClose();},[onClose]);
  useEffect(()=>{
    if(isOpen){document.addEventListener('keydown',onKey);document.body.style.overflow='hidden';}
    return()=>{document.removeEventListener('keydown',onKey);document.body.style.overflow='';};
  },[isOpen,onKey]);
  if(!isOpen)return null;
  return(
    <div ref={ref} onClick={(e)=>{if(e.target===ref.current)onClose();}} role="dialog" aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={cn('relative w-full bg-gray-800 rounded-2xl shadow-2xl border border-gray-700',sizes[size])}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"><X className="w-5 h-5"/></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
};
export default Modal;
