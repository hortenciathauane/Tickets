/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { User, Chamado } from './types';
import {
  fetchAllChamados,
  createChamado,
  updateChamado,
  getActiveSupabaseConfig,
  testConnection
} from './lib/supabase';
import { Navbar } from './components/Navbar';
import { LoginView } from './components/LoginView';
import { OperatorDashboard } from './components/OperatorDashboard';
import { MechanicDashboard } from './components/MechanicDashboard';
import { NewTicketModal } from './components/NewTicketModal';
import { CloseTicketModal } from './components/CloseTicketModal';
import { TicketDetailModal } from './components/TicketDetailModal';
import { SupabaseModal } from './components/SupabaseModal';
import { CheckCircle2, AlertCircle, Database } from 'lucide-react';

const USER_SESSION_KEY = 'maint_active_user';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(USER_SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [supabaseStatus, setSupabaseStatus] = useState<'connected' | 'checking' | 'local'>('checking');
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false);

  // Modals
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [ticketToClose, setTicketToClose] = useState<Chamado | null>(null);
  const [selectedTicketForDetail, setSelectedTicketForDetail] = useState<Chamado | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const cfg = getActiveSupabaseConfig();
    setIsSupabaseConfigured(cfg.isConfigured);

    try {
      if (cfg.isConfigured) {
        const testRes = await testConnection();
        if (testRes.connected && testRes.tableReady) {
          setSupabaseStatus('connected');
        } else {
          setSupabaseStatus('local');
        }
      } else {
        setSupabaseStatus('local');
      }

      const res = await fetchAllChamados();
      setChamados(res.data);
    } catch (err) {
      console.error('Erro ao carregar chamados:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    } catch (err) {
      console.warn('Erro ao salvar sessão:', err);
    }
    showToast(`Bem-vindo, ${user.name}! Modo ${user.role === 'operador' ? 'Operador' : 'Mecânico'} ativado.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(USER_SESSION_KEY);
    } catch {
      // ignore
    }
    showToast('Sessão encerrada com sucesso.', 'info');
  };

  // Operator opens ticket
  const handleCreateTicket = async (ticketData: Omit<Chamado, 'id' | 'created_at' | 'updated_at'>) => {
    const newId = `CH-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    const novoChamado: Chamado = {
      ...ticketData,
      id: newId,
      created_at: now,
      updated_at: now,
    };

    const res = await createChamado(novoChamado);
    setChamados((prev) => [res.data, ...prev]);

    if (res.syncedToSupabase) {
      showToast(`Chamado ${newId} aberto e sincronizado com o Supabase com sucesso!`);
    } else {
      showToast(`Chamado ${newId} registrado com sucesso (salvo localmente e pronto para o Supabase).`);
    }
  };

  // Mechanic takes ticket
  const handleStartService = async (chamado: Chamado) => {
    if (!currentUser) return;
    const res = await updateChamado(chamado.id, {
      status: 'Em Atendimento',
      mecanico: currentUser.username
    });

    if (res.data) {
      setChamados((prev) =>
        prev.map((c) => (c.id === chamado.id ? res.data! : c))
      );
      showToast(`Você assumiu o chamado ${chamado.id}. Status alterado para 'Em Atendimento'.`);
    }
  };

  // Mechanic closes ticket
  const handleCloseTicket = async (
    chamadoId: string,
    solutionData: { solucao: string; pecas_utilizadas?: string; tempo_gasto?: string; mecanico: string }
  ) => {
    const now = new Date().toISOString();
    const res = await updateChamado(chamadoId, {
      status: 'Encerrado',
      closed_at: now,
      ...solutionData
    });

    if (res.data) {
      setChamados((prev) =>
        prev.map((c) => (c.id === chamadoId ? res.data! : c))
      );
      if (res.syncedToSupabase) {
        showToast(`Chamado ${chamadoId} encerrado e sincronizado no Supabase!`, 'success');
      } else {
        showToast(`Chamado ${chamadoId} encerrado com sucesso! Salvo localmente.`, 'success');
      }
    }
  };

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        user={currentUser}
        onLogout={handleLogout}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        isSupabaseConfigured={isSupabaseConfigured}
        supabaseStatus={supabaseStatus}
      />

      {/* Supabase status notification banner if not yet connected to remote */}
      {supabaseStatus !== 'connected' && (
        <div className="bg-slate-900 border-b border-slate-800 py-2 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>
                <strong>Pronto para Supabase:</strong> Os chamados estão sendo guardados e persistidos localmente. Conecte sua URL e chave do Supabase a qualquer momento para sincronização remota.
              </span>
            </div>
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="ml-3 font-semibold text-amber-400 hover:text-amber-300 underline whitespace-nowrap"
            >
              Configurar Conexão &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentUser.role === 'operador' ? (
          <OperatorDashboard
            currentUser={currentUser}
            chamados={chamados}
            isLoading={isLoading}
            onRefresh={loadData}
            onOpenNewTicketModal={() => setIsNewTicketModalOpen(true)}
            onViewTicketDetails={(c) => setSelectedTicketForDetail(c)}
          />
        ) : (
          <MechanicDashboard
            currentUser={currentUser}
            chamados={chamados}
            isLoading={isLoading}
            onRefresh={loadData}
            onViewTicketDetails={(c) => setSelectedTicketForDetail(c)}
            onStartService={handleStartService}
            onOpenCloseTicketModal={(c) => setTicketToClose(c)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ManutSys Industrial &copy; {new Date().getFullYear()} · Sistema de Ordens de Manutenção</span>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Operador: operador / operador123</span>
            <span aria-hidden="true">·</span>
            <span>Mecânico: mecanico / mecanico123</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <NewTicketModal
        isOpen={isNewTicketModalOpen}
        currentUser={currentUser}
        onClose={() => setIsNewTicketModalOpen(false)}
        onSubmit={handleCreateTicket}
      />

      <CloseTicketModal
        isOpen={!!ticketToClose}
        chamado={ticketToClose}
        currentUser={currentUser}
        onClose={() => setTicketToClose(null)}
        onSubmit={handleCloseTicket}
      />

      <TicketDetailModal
        isOpen={!!selectedTicketForDetail}
        chamado={selectedTicketForDetail}
        currentUserRole={currentUser.role}
        onClose={() => setSelectedTicketForDetail(null)}
        onOpenCloseTicketModal={(c) => setTicketToClose(c)}
        onStartService={handleStartService}
      />

      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConfigChanged={loadData}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl text-xs font-medium bg-slate-900 border border-slate-700 text-slate-100 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
