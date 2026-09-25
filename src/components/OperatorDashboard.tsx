import React, { useState } from 'react';
import { Chamado, User } from '../types';
import { TicketCard } from './TicketCard';
import { PlusCircle, Search, Filter, AlertOctagon, Wrench, CheckCircle2, RefreshCw } from 'lucide-react';

interface OperatorDashboardProps {
  currentUser: User;
  chamados: Chamado[];
  isLoading: boolean;
  onRefresh: () => void;
  onOpenNewTicketModal: () => void;
  onViewTicketDetails: (chamado: Chamado) => void;
}

export const OperatorDashboard: React.FC<OperatorDashboardProps> = ({
  currentUser,
  chamados,
  isLoading,
  onRefresh,
  onOpenNewTicketModal,
  onViewTicketDetails,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Aberto' | 'Em Atendimento' | 'Encerrado'>('Todos');
  const [onlyMine, setOnlyMine] = useState(false);

  // Compute metrics
  const totalOpen = chamados.filter((c) => c.status === 'Aberto').length;
  const totalInProgress = chamados.filter((c) => c.status === 'Em Atendimento').length;
  const totalClosed = chamados.filter((c) => c.status === 'Encerrado').length;

  const filteredChamados = chamados.filter((c) => {
    if (onlyMine && c.operador !== currentUser.username) return false;
    if (statusFilter !== 'Todos' && c.status !== statusFilter) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchTitle = c.titulo.toLowerCase().includes(term);
      const matchEquip = c.equipamento.toLowerCase().includes(term);
      const matchTag = c.tag_equipamento?.toLowerCase().includes(term);
      const matchDesc = c.descricao.toLowerCase().includes(term);
      const matchSector = c.setor.toLowerCase().includes(term);
      return matchTitle || matchEquip || matchTag || matchDesc || matchSector;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div>
          <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
            Painel do Operador
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-0.5">
            Abertura & Acompanhamento de Ordens
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Abra ordens de serviço ao detectar anormalidades mecânicas, hidráulicas ou estruturais na sua linha de produção.
          </p>
        </div>

        <button
          onClick={onOpenNewTicketModal}
          className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Abrir Novo Chamado</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Aguardando Atendimento</span>
            <AlertOctagon className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-amber-400">
            {totalOpen}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Na fila dos mecânicos
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Em Manutenção</span>
            <Wrench className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-sky-400">
            {totalInProgress}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Mecânicos trabalhando no local
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Chamados Encerrados</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-emerald-400">
            {totalClosed}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Equipamentos liberados
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por equipamento, tag (ex: CNC-04), defeito ou setor..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Toggle only mine */}
            <button
              onClick={() => setOnlyMine(!onlyMine)}
              className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                onlyMine
                  ? 'border-amber-400/60 bg-amber-400/10 text-amber-300 font-medium'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              Apenas Meus Chamados
            </button>

            {/* Refresh button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Recarregar dados"
              className="p-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Status segmented tabs (Allowed as functional filter buttons) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
          {(['Todos', 'Aberto', 'Em Atendimento', 'Encerrado'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                statusFilter === status
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {status === 'Todos' ? 'Todos os Chamados' : status}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-500 font-mono tabular-nums">
            {filteredChamados.length} {filteredChamados.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredChamados.length > 0 ? (
          filteredChamados.map((chamado) => (
            <TicketCard
              key={chamado.id}
              chamado={chamado}
              currentUserRole="operador"
              onViewDetails={onViewTicketDetails}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-lg p-6">
            <AlertOctagon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <div className="text-sm font-semibold text-slate-300">
              Nenhum chamado encontrado
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Nenhum chamado corresponde aos filtros atuais. Você pode abrir uma nova ordem ou ajustar a busca.
            </p>
            <button
              onClick={onOpenNewTicketModal}
              className="mt-4 px-4 py-2 bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg hover:bg-amber-300 transition-colors"
            >
              Criar Primeiro Chamado
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
