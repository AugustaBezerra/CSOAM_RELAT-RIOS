"use client";

import React from 'react';
import { FileText, Eye, History, LogOut, Calendar, User as UserIcon } from 'lucide-react';
import { basePath } from '@/lib/constants';

interface NavbarProps {
  currentTab: 'form' | 'report' | 'history';
  onTabChange: (tab: 'form' | 'report' | 'history') => void;
  currentUser: { name: string; role: string; email: string };
  onLogout: () => void;
  currentDate: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  onLogout,
  currentDate,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Marca */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 p-1 flex items-center justify-center">
              <img 
                src={`${basePath}/assets/logo.png`}
                alt="CSOAM" 
                className="w-full h-full object-contain"
                style={{ maxHeight: '36px', maxWidth: '36px' }}
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-emerald-900 text-lg tracking-tight">CSOAM</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">ASO</span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium hidden sm:block">Produção Operacional Integrada</p>
            </div>
          </div>

          {/* Abas de Navegação Central */}
          <nav className="flex items-center bg-gray-100/80 p-1 rounded-2xl border border-gray-200/60 shadow-inner">
            <button
              onClick={() => onTabChange('history')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                currentTab === 'history'
                  ? 'bg-white text-emerald-800 shadow-sm border border-emerald-100'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <History className="w-4 h-4 text-emerald-600" />
              <span>Relatórios</span>
            </button>

            <button
              onClick={() => onTabChange('form')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                currentTab === 'form'
                  ? 'bg-white text-emerald-800 shadow-sm border border-emerald-100'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Preenchimento</span>
            </button>

            <button
              onClick={() => onTabChange('report')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                currentTab === 'report'
                  ? 'bg-white text-emerald-800 shadow-sm border border-emerald-100'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye className="w-4 h-4 text-blue-600" />
              <span>Relatório do Médico</span>
            </button>
          </nav>

          {/* Usuário e Sair */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-bold text-gray-900">{currentUser.name}</span>
              <span className="text-[11px] text-emerald-700 font-medium">{currentUser.role}</span>
            </div>

            <button
              onClick={onLogout}
              title="Sair do sistema"
              className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
