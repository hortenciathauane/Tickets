import React, { useState } from 'react';
import { Chamado, Prioridade, User } from '../types';
import { X, PlusCircle, AlertCircle, Sparkles } from 'lucide-react';

interface NewTicketModalProps {
  isOpen: boolean;
  currentUser: User;
  onClose: () => void;
  onSubmit: (chamadoData: Omit<Chamado, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

const COMMON_EQUIPMENT = [
  { name: 'Torno CNC Mazak 04', tag: 'CNC-MZ-04', sector: 'Usinagem' },
  { name: 'Prensa Hidráulica 120T', tag: 'PR-120-02', sector: 'Estamparia' },
  { name: 'Esteira Transportadora Linha 03', tag: 'EST-L03-A', sector: 'Embalagem' },
  { name: 'Compressor de Ar Industrial Atlas', tag: 'CMP-AT-01', sector: 'Utilidades' },
  { name: 'Robô de Solda Fanuc R2000', tag: 'ROB-FN-08', sector: 'Soldagem' },
  { name: 'Ponte Rolante 10 Toneladas', tag: 'PNT-10T-01', sector: 'Logística' }
];

export const NewTicketModal: React.FC<NewTicketModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onSubmit
}) => {
  const [titulo, setTitulo] = useState('');
  const [equipamento, setEquipamento] = useState('');
  const [tagEquipamento, setTagEquipamento] = useState('');
  const [setor, setSetor] = useState('Usinagem');
  const [prioridade, setPrioridade] = useState<Prioridade>('Média');
  const [descricao, setDescricao] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSelectQuickEquipment = (item: typeof COMMON_EQUIPMENT[0]) => {
    setEquipamento(item.name);
    setTagEquipamento(item.tag);
    setSetor(item.sector);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!titulo.trim()) {
      setErrorMsg('Por favor, informe um título ou resumo para o chamado.');
      return;
    }
    if (!equipamento.trim()) {
      setErrorMsg('Por favor, especifique o equipamento com defeito.');
      return;
    }
    if (!descricao.trim()) {
      setErrorMsg('Por favor, descreva detalhadamente os sintomas ou o problema verificado.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        titulo: titulo.trim(),
        equipamento: equipamento.trim(),
        tag_equipamento: tagEquipamento.trim() || undefined,
        setor: setor.trim(),
        prioridade,
        descricao: descricao.trim(),
        status: 'Aberto',
        operador: currentUser.username
      });

      // reset form
      setTitulo('');
      setEquipamento('');
      setTagEquipamento('');
      setDescricao('');
      setPrioridade('Média');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Erro ao criar chamado: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                Abertura de Chamado de Manutenção
              </h2>
              <p className="text-xs text-slate-400">
                Preencha os dados do equipamento e descreva a anomalia verificada
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick equipment suggestions */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1.5">
              Sugestões rápidas de máquinas na planta:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_EQUIPMENT.map((item) => (
                <button
                  type="button"
                  key={item.tag}
                  onClick={() => handleSelectQuickEquipment(item)}
                  className="px-2.5 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-slate-200 block mb-1">
                Equipamento / Máquina *
              </label>
              <input
                type="text"
                required
                value={equipamento}
                onChange={(e) => setEquipamento(e.target.value)}
                placeholder="Ex: Torno CNC Mazak 04"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="font-medium text-slate-200 block mb-1">
                Tag / Código Patrimônio
              </label>
              <input
                type="text"
                value={tagEquipamento}
                onChange={(e) => setTagEquipamento(e.target.value)}
                placeholder="Ex: CNC-MZ-04"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-slate-200 block mb-1">
                Setor / Linha de Produção *
              </label>
              <select
                value={setor}
                onChange={(e) => setSetor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
              >
                <option value="Usinagem">Usinagem</option>
                <option value="Estamparia">Estamparia</option>
                <option value="Montagem">Montagem Final</option>
                <option value="Soldagem">Soldagem & Caldeiraria</option>
                <option value="Embalagem">Embalagem & Expedição</option>
                <option value="Logística">Logística Interna</option>
                <option value="Utilidades">Utilidades (Compressores/Subestação)</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-slate-200 block mb-1">
                Grau de Prioridade *
              </label>
              <select
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as Prioridade)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-medium"
              >
                <option value="Baixa">Baixa (Pode aguardar parada programada)</option>
                <option value="Média">Média (Atenção necessária em breve)</option>
                <option value="Alta">Alta (Máquina operando com risco ou lentidão)</option>
                <option value="Crítica">Crítica (Linha parada / Risco iminente)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-medium text-slate-200 block mb-1">
              Título / Assunto Resumido da Falha *
            </label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Aquecimento excessivo no fuso principal com ruído metálico"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-medium text-slate-200">
                Descrição Detalhada do Problema *
              </label>
              <span className="text-[11px] text-slate-500">
                Seja específico: ruídos, códigos de alarme na tela, odores, etc.
              </span>
            </div>
            <textarea
              required
              rows={4}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o que o operador observou: 'A máquina disparou o alarme 204 no painel ao iniciar o ciclo de avanço rápido. Verifiquei óleo lubrificante ok, porém há trepidação severa e cheiro de queimado no motor de passo traseiro...'"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400 leading-relaxed"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Operador solicitante: <strong className="text-slate-300 font-normal">{currentUser.username}</strong>
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
                className="px-5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{submitting ? 'Registrando...' : 'Emitir Chamado'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
