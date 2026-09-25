import React, { useState } from 'react';
import { Chamado, User } from '../types';
import { X, CheckCircle2, Wrench, AlertCircle, Clock, PackageCheck } from 'lucide-react';

interface CloseTicketModalProps {
  isOpen: boolean;
  chamado: Chamado | null;
  currentUser: User;
  onClose: () => void;
  onSubmit: (chamadoId: string, solutionData: { solucao: string; pecas_utilizadas?: string; tempo_gasto?: string; mecanico: string }) => Promise<void>;
}

export const CloseTicketModal: React.FC<CloseTicketModalProps> = ({
  isOpen,
  chamado,
  currentUser,
  onClose,
  onSubmit
}) => {
  const [solucao, setSolucao] = useState('');
  const [pecasUtilizadas, setPecasUtilizadas] = useState('');
  const [tempoGasto, setTempoGasto] = useState('45 min');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !chamado) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!solucao.trim()) {
      setErrorMsg('Por favor, descreva detalhadamente o que foi feito para corrigir o problema.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(chamado.id, {
        solucao: solucao.trim(),
        pecas_utilizadas: pecasUtilizadas.trim() || undefined,
        tempo_gasto: tempoGasto.trim() || undefined,
        mecanico: currentUser.username
      });

      setSolucao('');
      setPecasUtilizadas('');
      setTempoGasto('45 min');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Erro ao encerrar chamado: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                Encerramento de Chamado Técnico
              </h2>
              <p className="text-xs text-slate-400">
                Descreva as intervenções realizadas pelo mecânico para liberação do equipamento
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Ticket Summary Box */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 text-xs">
                {chamado.titulo}
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                {chamado.tag_equipamento || chamado.equipamento}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2">
              <strong className="text-slate-300">Relato do operador ({chamado.operador}):</strong> {chamado.descricao}
            </p>
          </div>

          {/* Solucao Description (Required) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                <span>O que foi feito (Ações e Reparo) *</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Obrigatório para fechamento da OS
              </span>
            </div>
            <textarea
              required
              rows={4}
              value={solucao}
              onChange={(e) => setSolucao(e.target.value)}
              placeholder="Descreva o diagnóstico e ações executadas: 'Desmontado o cabeçote principal, verificado desgaste prematuro no retentor de óleo e folga axial no rolamento. Realizada limpeza química, troca dos componentes, lubrificação com graxa ISO VG 220 e teste de rotação a 3000 RPM por 20 minutos com temperatura estabilizada em 42°C. Máquina liberada para produção.'"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-400 leading-relaxed"
            />
          </div>

          {/* Peças e Componentes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-slate-200 block mb-1 flex items-center gap-1.5">
                <PackageCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Peças e Materiais Utilizados</span>
              </label>
              <input
                type="text"
                value={pecasUtilizadas}
                onChange={(e) => setPecasUtilizadas(e.target.value)}
                placeholder="Ex: 1x Rolamento SKF 6205, 1x Retentor 35x52x7, 300ml Graxa Sintética"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="font-medium text-slate-200 block mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Tempo Gasto na Intervenção</span>
              </label>
              <input
                type="text"
                value={tempoGasto}
                onChange={(e) => setTempoGasto(e.target.value)}
                placeholder="Ex: 1h 20min"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-400 font-mono"
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-lg text-emerald-300 text-xs">
            Ao confirmar o encerramento, o chamado será marcado como <strong>Encerrado</strong>, com registro do mecânico <strong>{currentUser.username}</strong> e sincronizado no Supabase.
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Mecânico responsável: <strong className="text-slate-300 font-normal">{currentUser.username}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{submitting ? 'Encerrando...' : 'Confirmar Encerramento'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
