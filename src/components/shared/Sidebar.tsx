'use client';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Dumbbell, Salad, Calculator, TrendingUp, ListChecks, UserCircle2, Zap, CalendarDays } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
const NAV=[
  {label:'Dashboard',href:'/dashboard',Icon:LayoutDashboard},
  {label:'Attendance & Logs',href:'/calendar',Icon:CalendarDays},
  {label:'Workout',href:'/workout',Icon:Dumbbell},
  {label:'Nutrition',href:'/nutrition',Icon:Salad},
  {label:'Food Calculator',href:'/nutrition/food-calculator',Icon:Calculator},
  {label:'Progress',href:'/progress',Icon:TrendingUp},
  {label:'Exercises',href:'/exercises',Icon:ListChecks},
  {label:'Profile',href:'/profile',Icon:UserCircle2},
];
const initials=(name?:string|null,email?:string|null)=>{
  if(name)return name.split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase();
  if(email)return email[0].toUpperCase();
  return 'U';
};
const Sidebar=({isOpen}:{isOpen:boolean})=>{
  const pathname=usePathname();
  const {user}=useAuth();
  return(
    <>
      <div className={cn('fixed inset-0 z-20 bg-black/50 lg:hidden transition-opacity duration-300',isOpen?'opacity-100':'opacity-0 pointer-events-none')}/>
      <aside className={cn('fixed top-0 left-0 z-30 h-full flex flex-col w-64 bg-gray-900 border-r border-gray-800 transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto',isOpen?'translate-x-0':'-translate-x-full')}>
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-gray-800">
          <div className="p-1.5 rounded-lg bg-orange-500"><Zap className="w-5 h-5 text-white"/></div>
          <span className="text-xl font-bold text-white">Gym<span className="text-orange-400">Frek</span></span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-0.5">
            {NAV.map(({label,href,Icon})=>{
              const active=href==='/dashboard'?pathname===href:pathname===href||pathname.startsWith(href+'/');
              return(
                <li key={href}>
                  <Link href={href} className={cn('relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',active?'text-orange-400 bg-gray-800':'text-gray-400 hover:text-gray-100 hover:bg-gray-800/60')}>
                    {active&&<span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-orange-500 rounded-full"/>}
                    <Icon className="w-5 h-5 flex-shrink-0"/><span>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-gray-800 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-white">{initials(user?.displayName,user?.email)}</span>
            </div>
            <div className="min-w-0 flex-1">
              {user?.displayName&&<p className="text-sm font-semibold text-white truncate">{user.displayName}</p>}
              {user?.email&&<p className="text-xs text-gray-400 truncate">{user.email}</p>}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
