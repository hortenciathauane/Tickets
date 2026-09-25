import React, { useState } from 'react';
import { Chamado, User } from '../types';
import { TicketCard } from './TicketCard';
import { Wrench, CheckCircle2, Clock, Search, AlertOctagon, RefreshCw, Zap } from 'lucide-react';

interface MechanicDashboardProps {
  currentUser: User;
  chamados: Chamado[];
  isLoading: boolean;
  onRefresh: () => void;
  onViewTicketDetails: (chamado: Chamado) => void;
  onStartService: (chamado: Chamado) => void;
  onOpenCloseTicketModal: (chamado: Chamado) => void;
}

export const MechanicDashboard: React.FC<MechanicDashboardProps> = ({
  currentUser,
  chamados,
  isLoading,
  onRefresh,
  onViewTicketDetails,
  onStartService,
  onOpenCloseTicketModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Fila' | 'Em Atendimento' | 'Encerrado' | 'Todos'>('Fila');
  const [onlyMine, setOnlyMine] = useState(false);

  // Compute metrics
  const pendingQueue = chamados.filter((c) => c.status === 'Aberto');
  const inProgress = chamados.filter((c) => c.status === 'Em Atendimento');
  const myAssigned = chamados.filter((c) => c.mecanico === currentUser.username && c.status === 'Em Atendimento');
  const resolved = chamados.filter((c) => c.status === 'Encerrado');

  const filteredChamados = chamados.filter((c) => {
    if (onlyMine && c.mecanico !== currentUser.username) return false;

    if (statusFilter === 'Fila') {
      if (c.status !== 'Aberto') return false;
    } else if (statusFilter !== 'Todos') {
      if (c.status !== statusFilter) return false;
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchTitle = c.titulo.toLowerCase().includes(term);
      const matchEquip = c.equipamento.toLowerCase().includes(term);
      const matchTag = c.tag_equipamento?.toLowerCase().includes(term);
      const matchDesc = c.descricao.toLowerCase().includes(term);
      const matchSector = c.setor.toLowerCase().includes(term);
      const matchOperator = c.operador.toLowerCase().includes(term);
      return matchTitle || matchEquip || matchTag || matchDesc || matchSector || matchOperator;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-sky-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5" />
              <span>Painel da Equipe de Manutenção Mecânica</span>
            </div>
            <h1 className="text-xl font-bold text-slate-100 mt-0.5">
              Fila de Ordens de Serviço & Intervenções
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Assuma chamados em aberto para iniciar o diagnóstico na planta e registre o relatório técnico com as ações executadas ao finalizar.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-slate-400">
              Plantão: <strong className="text-slate-200">{currentUser.name}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setStatusFilter('Fila')}
          className={`cursor-pointer rounded-lg p-3.5 border transition-all ${
            statusFilter === 'Fila'
              ? 'bg-amber-950/30 border-amber-500/50'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Fila Aguardando</span>
            <AlertOctagon className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-amber-400">
            {pendingQueue.length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Chamados sem mecânico</div>
        </div>

        <div
          onClick={() => setStatusFilter('Em Atendimento')}
          className={`cursor-pointer rounded-lg p-3.5 border transition-all ${
            statusFilter === 'Em Atendimento'
              ? 'bg-sky-950/30 border-sky-500/50'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Em Manutenção</span>
            <Wrench className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-sky-400">
            {inProgress.length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Em atendimento ativo</div>
        </div>

        <div
          onClick={() => {
            setStatusFilter('Em Atendimento');
            setOnlyMine(true);
          }}
          className="cursor-pointer bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg p-3.5 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Comigo Agora</span>
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-indigo-400">
            {myAssigned.length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Sob minha responsabilidade</div>
        </div>

        <div
          onClick={() => setStatusFilter('Encerrado')}
          className={`cursor-pointer rounded-lg p-3.5 border transition-all ${
            statusFilter === 'Encerrado'
              ? 'bg-emerald-950/30 border-emerald-500/50'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Histórico Encerrado</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-emerald-400">
            {resolved.length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Ordens finalizadas</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar equipamento, tag, operador, descrição..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setOnlyMine(!onlyMine)}
              className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                onlyMine
                  ? 'border-sky-400/60 bg-sky-400/10 text-sky-300 font-medium'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              Apenas Atendidos por Mim
            </button>

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

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setStatusFilter('Fila')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              statusFilter === 'Fila'
                ? 'bg-amber-400 text-slate-950'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            Fila de Espera (Abertos)
          </button>
          <button
            onClick={() => setStatusFilter('Em Atendimento')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              statusFilter === 'Em Atendimento'
                ? 'bg-sky-400 text-slate-950'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            Em Atendimento
          </button>
          <button
            onClick={() => setStatusFilter('Encerrado')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              statusFilter === 'Encerrado'
                ? 'bg-emerald-400 text-slate-950'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            Histórico Concluído
          </button>
          <button
            onClick={() => setStatusFilter('Todos')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              statusFilter === 'Todos'
                ? 'bg-slate-200 text-slate-950'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos os Chamados
          </button>

          <span className="ml-auto text-xs text-slate-500 font-mono tabular-nums">
            {filteredChamados.length} {filteredChamados.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>
      </div>

      {/* Ticket Cards */}
      <div className="space-y-3">
        {filteredChamados.length > 0 ? (
          filteredChamados.map((chamado) => (
            <TicketCard
              key={chamado.id}
              chamado={chamado}
              currentUserRole="mecanico"
              onViewDetails={onViewTicketDetails}
              onStartService={onStartService}
              onCloseTicket={onOpenCloseTicketModal}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-lg p-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-400/60 mx-auto mb-2" />
            <div className="text-sm font-semibold text-slate-300">
              Nenhuma ordem nesta categoria
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Não há chamados pendentes com os filtros selecionados. Altere os filtros ou recarregue a lista.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
