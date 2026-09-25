import React, { useState, useEffect } from 'react';
import {
  getActiveSupabaseConfig,
  saveSupabaseCustomCredentials,
  clearSupabaseCustomCredentials,
  testConnection,
  SUPABASE_SQL_SCHEMA
} from '../lib/supabase';
import { Database, CheckCircle2, AlertCircle, Copy, Check, RefreshCw, X, ExternalLink, ShieldCheck } from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose, onConfigChanged }) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [source, setSource] = useState<'env' | 'custom' | 'none'>('none');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ connected: boolean; message: string; tableReady: boolean } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'sql'>('config');

  useEffect(() => {
    if (isOpen) {
      const cfg = getActiveSupabaseConfig();
      setUrl(cfg.url);
      setAnonKey(cfg.anonKey);
      setSource(cfg.source);
      handleTest();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testConnection();
      setTestResult(res);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setTestResult({
        connected: false,
        tableReady: false,
        message: `Erro no teste: ${msg}`
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    if (!url.trim() || !anonKey.trim()) {
      alert('Por favor, informe a URL e a Chave Anon do Supabase.');
      return;
    }
    saveSupabaseCustomCredentials(url, anonKey);
    const cfg = getActiveSupabaseConfig();
    setSource(cfg.source);
    onConfigChanged();
    handleTest();
  };

  const handleClear = () => {
    clearSupabaseCustomCredentials();
    const cfg = getActiveSupabaseConfig();
    setUrl(cfg.url);
    setAnonKey(cfg.anonKey);
    setSource(cfg.source);
    setTestResult(null);
    onConfigChanged();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                Integração Supabase
              </h2>
              <p className="text-xs text-slate-400">
                Conexão com banco de dados em tempo real para ordens e chamados
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

        {/* Tab selection */}
        <div className="px-6 pt-3 border-b border-slate-800 flex gap-2">
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'config'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Conexão & Credenciais
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'sql'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Script SQL da Tabela (1 Clique)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-300">
          {activeTab === 'config' && (
            <>
              {/* Status Banner */}
              <div
                className={`p-4 rounded-lg border flex items-start gap-3 ${
                  testResult?.connected && testResult.tableReady
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : testResult?.connected && !testResult.tableReady
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300'
                }`}
              >
                {testResult?.connected && testResult.tableReady ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-semibold text-xs uppercase tracking-wide">
                    {testResult?.connected
                      ? testResult.tableReady
                        ? 'Supabase Conectado e Operacional'
                        : 'Conectado ao Supabase (Tabela Pendente)'
                      : 'Modo Offline / Local com Fallback Ativo'}
                  </div>
                  <p className="text-xs mt-1 text-slate-300 leading-relaxed">
                    {testResult?.message ||
                      'O sistema está pronto para enviar os dados diretamente ao Supabase. Insira as credenciais do seu projeto abaixo.'}
                  </p>
                  {testResult?.connected && !testResult.tableReady && (
                    <button
                      onClick={() => setActiveTab('sql')}
                      className="mt-2 text-xs font-semibold text-amber-300 underline hover:text-amber-200"
                    >
                      Copiar o script SQL para criar a tabela `chamados` &rarr;
                    </button>
                  )}
                </div>
                <button
                  onClick={handleTest}
                  disabled={testing}
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${testing ? 'animate-spin' : ''}`} />
                  <span>{testing ? 'Testando...' : 'Testar'}</span>
                </button>
              </div>

              {/* Form credentials */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      Project URL (Supabase)
                    </label>
                    {source === 'env' && (
                      <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Carregado via .env
                      </span>
                    )}
                  </div>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      Anon Public Key
                    </label>
                  </div>
                  <input
                    type="password"
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Encontrada em: Supabase Dashboard &gt; Project Settings &gt; API &gt; anon public.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                {source === 'custom' ? (
                  <button
                    onClick={handleClear}
                    className="text-xs text-rose-400 hover:text-rose-300 underline"
                  >
                    Limpar credenciais manuais
                  </button>
                ) : <span />}

                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 text-xs font-medium text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors font-semibold"
                  >
                    Salvar e Conectar
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xs font-semibold text-slate-200">
                    Como executar o script completo (Tabela + Storage de Fotos/Laudos):
                  </h3>
                  <ol className="text-xs text-slate-400 list-decimal list-inside space-y-1 mt-1.5">
                    <li>Acesse seu painel no Supabase (<a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-emerald-400 underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-2.5 h-2.5" /></a>).</li>
                    <li>No menu lateral esquerdo, clique em <strong>SQL Editor</strong>.</li>
                    <li>Clique em <strong>+ New Query</strong>, cole o código abaixo e clique em <strong>Run</strong>.</li>
                    <li>Pronto! A tabela `chamados`, o bucket `manutencao-arquivos` e todas as <strong>Políticas de Armazenamento e RLS</strong> estarão configuradas e ativas.</li>
                  </ol>
                </div>
                <button
                  onClick={handleCopySql}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 transition-colors shrink-0"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar SQL</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-emerald-300/90 overflow-x-auto max-h-72 leading-relaxed">
                  {SUPABASE_SQL_SCHEMA}
                </pre>
              </div>

              <div className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-lg flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Inclui: Criação da tabela, RLS, Realtime, criação do bucket `manutencao-arquivos` e as 4 políticas de armazenamento (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) em `storage.objects`.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
