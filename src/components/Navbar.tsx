import React from 'react';
import { User } from '../types';
import { Database, LogOut, Wrench, HardHat, CheckCircle2, AlertTriangle } from 'lucide-react';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  onOpenSupabaseModal: () => void;
  isSupabaseConfigured: boolean;
  supabaseStatus: 'connected' | 'checking' | 'local';
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onOpenSupabaseModal,
  isSupabaseConfigured,
  supabaseStatus
}) => {
  const isMechanic = user.role === 'mecanico';

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            {isMechanic ? <Wrench className="w-5 h-5" /> : <HardHat className="w-5 h-5" />}
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-100 font-sans">
            ManutSys <span className="text-amber-400 font-normal text-sm ml-1">Industrial</span>
          </span>
        </div>

        {/* Zone 2: Navigation & Status indicator */}
        <div className="hidden sm:flex items-center gap-4 text-xs">
          <button
            onClick={onOpenSupabaseModal}
            className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-colors ${
              supabaseStatus === 'connected'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title="Gerenciar conexão com o Supabase"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="font-medium">
              {supabaseStatus === 'connected'
                ? 'Supabase Conectado'
                : isSupabaseConfigured
                ? 'Supabase Sincronizando'
                : 'Supabase: Pronto p/ Conectar'}
            </span>
            {supabaseStatus === 'connected' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
        </div>

        {/* Zone 3: Profile & Logout */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <div className="text-sm font-semibold text-slate-200">{user.name}</div>
            <div className="text-xs text-slate-400 capitalize">
              {user.role === 'operador' ? 'Operador de Produção' : 'Mecânico de Manutenção'} · <span className="font-mono text-slate-500">{user.badgeId}</span>
            </div>
          </div>

          <button
            onClick={onOpenSupabaseModal}
            className="sm:hidden p-2 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            title="Configurar Supabase"
            aria-label="Configurar Supabase"
          >
            <Database className="w-4 h-4" />
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors whitespace-nowrap"
            title="Encerrar sessão"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
};
