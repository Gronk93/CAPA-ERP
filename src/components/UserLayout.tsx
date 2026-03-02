import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Bell } from 'lucide-react';
import CapaLogo from './CapaLogo';

export default function UserLayout({ user, onLogout, children }: { user: any, onLogout: () => void, children?: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
          <CapaLogo className="h-10 w-auto" />
        </div>
        
        <div className="flex items-center space-x-6">
          <button className="text-slate-400 hover:text-slate-600 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          
          <div className="flex items-center space-x-3 border-l border-slate-200 pl-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-700">{user.nombre}</p>
              <p className="text-xs text-slate-500">Usuario</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
              {user.nombre.charAt(0)}
            </div>
            <button onClick={onLogout} className="ml-2 text-slate-400 hover:text-red-600 transition-colors">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6 lg:p-10 max-w-7xl mx-auto w-full">
        {children || <Outlet />}
      </main>
    </div>
  );
}
