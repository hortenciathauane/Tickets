import React from 'react';
import { Chamado, UserRole } from '../types';
import { Clock, Wrench, CheckCircle2, AlertOctagon, User, ArrowRight, FileText } from 'lucide-react';

interface TicketCardProps {
  chamado: Chamado;
  currentUserRole: UserRole;
  onViewDetails: (chamado: Chamado) => void;
  onStartService?: (chamado: Chamado) => void;
  onCloseTicket?: (chamado: Chamado) => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  chamado,
  currentUserRole,
  onViewDetails,
  onStartService,
  onCloseTicket,
}) => {
  const isMechanic = currentUserRole === 'mecanico';

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const getPriorityStyle = (prioridade: string) => {
    switch (prioridade) {
      case 'Crítica':
        return 'text-rose-400 font-semibold';
      case 'Alta':
        return 'text-amber-400 font-medium';
      case 'Média':
        return 'text-yellow-300 font-medium';
      case 'Baixa':
      default:
        return 'text-slate-400 font-normal';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Aberto':
        return <AlertOctagon className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'Em Atendimento':
        return <Wrench className="w-3.5 h-3.5 text-sky-400 shrink-0 animate-spin" style={{ animationDuration: '6s' }} />;
      case 'Encerrado':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg p-5 transition-all shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1 min-w-0">
          {/* Metadata line with typographic separators (Zero-Pill discipline) */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="font-mono text-slate-300 font-medium tracking-tight">
              {chamado.tag_equipamento || 'EQUIPAMENTO'}
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-300">{chamado.setor}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className={getPriorityStyle(chamado.prioridade)}>
              Prioridade {chamado.prioridade}
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="font-mono tabular-nums text-slate-500">
              {formatDateTime(chamado.created_at)}
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onViewDetails(chamado)}
            className="text-base font-semibold text-slate-100 hover:text-amber-400 transition-colors cursor-pointer truncate"
          >
            {chamado.titulo}
          </h3>

          {/* Machine & Description */}
          <div className="text-xs text-slate-400">
            <span className="font-medium text-slate-300">{chamado.equipamento}</span>
            <span className="mx-1.5 text-slate-600">—</span>
            <span className="line-clamp-2 text-slate-400 leading-relaxed">
              {chamado.descricao}
            </span>
          </div>
        </div>

        {/* Status display (Clean unboxed with dot/icon) */}
        <div className="flex items-center gap-1.5 self-start shrink-0 text-xs font-medium py-1 px-2.5 rounded bg-slate-800/80 border border-slate-700/60">
          {getStatusIcon(chamado.status)}
          <span
            className={
              chamado.status === 'Aberto'
                ? 'text-amber-300'
                : chamado.status === 'Em Atendimento'
                ? 'text-sky-300'
                : 'text-emerald-300'
            }
          >
            {chamado.status}
          </span>
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 text-slate-400">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3 text-slate-500" />
            <span>Aberto por: <strong className="font-normal text-slate-300">{chamado.operador}</strong></span>
          </div>
          {chamado.mecanico && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <div className="flex items-center gap-1">
                <Wrench className="w-3 h-3 text-sky-400" />
                <span>Mecânico: <strong className="font-normal text-sky-300">{chamado.mecanico}</strong></span>
              </div>
            </>
          )}
          {chamado.closed_at && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <div className="flex items-center gap-1 text-emerald-400">
                <Clock className="w-3 h-3" />
                <span className="font-mono tabular-nums">Concluído em {formatDateTime(chamado.closed_at)}</span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => onViewDetails(chamado)}
            className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Ver Detalhes</span>
          </button>

          {isMechanic && chamado.status === 'Aberto' && onStartService && (
            <button
              onClick={() => onStartService(chamado)}
              className="px-3 py-1.5 text-xs font-medium text-slate-900 bg-sky-400 hover:bg-sky-300 rounded transition-colors flex items-center gap-1"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Iniciar Atendimento</span>
            </button>
          )}

          {isMechanic && chamado.status !== 'Encerrado' && onCloseTicket && (
            <button
              onClick={() => onCloseTicket(chamado)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Encerrar Chamado</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
