'use client';
import { useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import Sidebar from '@/components/shared/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* 
        Permanently Fixed Left Sidebar:
        Fixed at top-0 left-0 h-screen w-64 on desktop (lg+).
        Drawer overlay on mobile (<lg).
      */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* 
        Right Content Area:
        Padded on the left by 64 (16rem / 256px) on desktop to sit cleanly alongside the fixed sidebar.
        Full width on mobile.
      */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 min-h-screen bg-gray-950">
        <Navbar onMenuClick={() => setSidebarOpen(o => !o)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

