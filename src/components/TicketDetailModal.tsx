import React from 'react';
import { Chamado, UserRole } from '../types';
import { X, Wrench, CheckCircle2, Clock, MapPin, Tag, User, AlertOctagon, PackageCheck, FileSpreadsheet } from 'lucide-react';

interface TicketDetailModalProps {
  isOpen: boolean;
  chamado: Chamado | null;
  currentUserRole: UserRole;
  onClose: () => void;
  onOpenCloseTicketModal?: (chamado: Chamado) => void;
  onStartService?: (chamado: Chamado) => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  isOpen,
  chamado,
  currentUserRole,
  onClose,
  onOpenCloseTicketModal,
  onStartService
}) => {
  if (!isOpen || !chamado) return null;

  const isMechanic = currentUserRole === 'mecanico';

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              chamado.status === 'Encerrado'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : chamado.status === 'Em Atendimento'
                ? 'bg-sky-500/10 border border-sky-500/30 text-sky-400'
                : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
            }`}>
              {chamado.status === 'Encerrado' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : chamado.status === 'Em Atendimento' ? (
                <Wrench className="w-5 h-5" />
              ) : (
                <AlertOctagon className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-400">{chamado.id}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className={`text-xs font-semibold ${
                  chamado.status === 'Encerrado'
                    ? 'text-emerald-400'
                    : chamado.status === 'Em Atendimento'
                    ? 'text-sky-400'
                    : 'text-amber-400'
                }`}>
                  {chamado.status}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-100 truncate max-w-md">
                {chamado.titulo}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Machine & Location Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 border border-slate-800 rounded-lg p-3.5">
            <div>
              <div className="text-[11px] text-slate-500">Equipamento</div>
              <div className="font-medium text-slate-200 truncate">{chamado.equipamento}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">Tag / Patrimônio</div>
              <div className="font-mono text-slate-200">{chamado.tag_equipamento || '—'}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">Setor da Planta</div>
              <div className="font-medium text-slate-200 truncate">{chamado.setor}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">Prioridade</div>
              <div className="font-semibold text-amber-400">{chamado.prioridade}</div>
            </div>
          </div>

          {/* Section 1: Descrição do Operador */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-800">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Abertura pelo Operador ({chamado.operador})</span>
              </span>
              <span className="font-mono tabular-nums text-slate-500">
                {formatDateTime(chamado.created_at)}
              </span>
            </div>
            <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg text-slate-200 leading-relaxed whitespace-pre-wrap">
              {chamado.descricao}
            </div>
          </div>

          {/* Section 2: Resolução do Mecânico (se houver ou se encerrado) */}
          {chamado.status === 'Encerrado' ? (
            <div className="space-y-3 bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between text-xs text-emerald-300 pb-1.5 border-b border-emerald-500/20">
                <span className="font-semibold flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Encerramento pelo Mecânico ({chamado.mecanico || 'mecanico'})</span>
                </span>
                <span className="font-mono tabular-nums text-emerald-400/80">
                  {formatDateTime(chamado.closed_at)}
                </span>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-wide text-emerald-400/90 font-semibold mb-1">
                  O que foi feito:
                </div>
                <p className="text-slate-100 leading-relaxed whitespace-pre-wrap text-xs">
                  {chamado.solucao || 'Intervenção concluída com sucesso.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-emerald-500/20 text-xs">
                <div>
                  <span className="text-[11px] text-emerald-400/80 block">Peças / Materiais:</span>
                  <span className="text-slate-200 font-medium">{chamado.pecas_utilizadas || 'Nenhum material adicional registrado'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-emerald-400/80 block">Tempo Gasto:</span>
                  <span className="font-mono text-slate-200 font-semibold">{chamado.tempo_gasto || '—'}</span>
                </div>
              </div>
            </div>
          ) : chamado.status === 'Em Atendimento' ? (
            <div className="p-4 bg-sky-950/20 border border-sky-500/30 rounded-lg flex items-start gap-3">
              <Wrench className="w-5 h-5 text-sky-400 shrink-0 mt-0.5 animate-spin" style={{ animationDuration: '6s' }} />
              <div>
                <h4 className="font-semibold text-sky-300 text-xs">
                  Equipamento em Manutenção Ativa
                </h4>
                <p className="text-slate-300 text-[11px] mt-0.5">
                  O mecânico <strong>{chamado.mecanico || 'mecanico'}</strong> está realizando as intervenções neste equipamento.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-lg text-amber-300 text-xs flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Aguardando atendimento na fila técnica de manutenção.</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Atualizado em: <span className="font-mono tabular-nums">{formatDateTime(chamado.updated_at)}</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Fechar
            </button>

            {isMechanic && chamado.status === 'Aberto' && onStartService && (
              <button
                onClick={() => {
                  onClose();
                  onStartService(chamado);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-900 bg-sky-400 hover:bg-sky-300 rounded transition-colors flex items-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Iniciar Atendimento</span>
              </button>
            )}

            {isMechanic && chamado.status !== 'Encerrado' && onOpenCloseTicketModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCloseTicketModal(chamado);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Encerrar Este Chamado</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
