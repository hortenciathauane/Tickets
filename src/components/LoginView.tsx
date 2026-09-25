import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { HardHat, Wrench, Lock, ArrowRight, Shield, AlertCircle } from 'lucide-react';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (cleanUser === 'operador' && cleanPass === 'operador123') {
      onLogin({
        username: 'operador',
        name: 'Carlos Oliveira',
        role: 'operador',
        badgeId: 'OP-4109'
      });
      return;
    }

    if (cleanUser === 'mecanico' && cleanPass === 'mecanico123') {
      onLogin({
        username: 'mecanico',
        name: 'Roberto Mendes',
        role: 'mecanico',
        badgeId: 'MEC-8201'
      });
      return;
    }

    setErrorMsg('Credenciais inválidas. Verifique o usuário e a senha.');
  };

  const handleQuickLogin = (role: UserRole) => {
    if (role === 'operador') {
      setUsername('operador');
      setPassword('operador123');
      onLogin({
        username: 'operador',
        name: 'Carlos Oliveira',
        role: 'operador',
        badgeId: 'OP-4109'
      });
    } else {
      setUsername('mecanico');
      setPassword('mecanico123');
      onLogin({
        username: 'mecanico',
        name: 'Roberto Mendes',
        role: 'mecanico',
        badgeId: 'MEC-8201'
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 text-slate-100">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-2">
            <Wrench className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
            ManutSys <span className="text-amber-400 font-normal">Industrial</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Sistema Integrado de Gestão de Ordens de Serviço e Chamados de Manutenção
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          {/* Quick Switch Profiles */}
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              Acesso Rápido por Perfil (1 Clique)
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickLogin('operador')}
                className="p-3 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-800 hover:border-amber-400/50 text-left transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <HardHat className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-xs text-slate-200">Operador</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Login: <span className="font-mono text-slate-300">operador</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Abre chamados e relata defeitos
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('mecanico')}
                className="p-3 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-800 hover:border-sky-400/50 text-left transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Wrench className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-xs text-slate-200">Mecânico</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Login: <span className="font-mono text-slate-300">mecanico</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Atende e encerra chamados
                </div>
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 text-[11px] text-slate-500 uppercase tracking-wider">
              Ou digite suas credenciais
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleManualSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Usuário (Login)
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="operador ou mecanico"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Senha de Acesso
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="operador123 ou mecanico123"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>Acessar Painel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Prompt reference note */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Contas configuradas conforme solicitado:</span>
            </div>
            <div className="flex justify-between font-mono text-[10px] text-slate-300 pt-1">
              <span>operador / operador123</span>
              <span className="text-slate-500">·</span>
              <span>mecanico / mecanico123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
