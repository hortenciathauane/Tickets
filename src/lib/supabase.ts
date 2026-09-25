import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Chamado } from '../types';
import { INITIAL_CHAMADOS } from '../mockData';

const LOCAL_STORAGE_KEY = 'maint_chamados_cache';
const URL_STORAGE_KEY = 'maint_supabase_url';
const KEY_STORAGE_KEY = 'maint_supabase_anon_key';

export function getActiveSupabaseConfig(): { url: string; anonKey: string; isConfigured: boolean; source: 'env' | 'custom' | 'none' } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();
  const customUrl = localStorage.getItem(URL_STORAGE_KEY)?.trim() || '';
  const customKey = localStorage.getItem(KEY_STORAGE_KEY)?.trim() || '';

  if (envUrl && envKey && envUrl.startsWith('http')) {
    return { url: envUrl, anonKey: envKey, isConfigured: true, source: 'env' };
  }
  if (customUrl && customKey && customUrl.startsWith('http')) {
    return { url: customUrl, anonKey: customKey, isConfigured: true, source: 'custom' };
  }
  return { url: customUrl || '', anonKey: customKey || '', isConfigured: false, source: 'none' };
}

let supabaseInstance: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export function getSupabase(): SupabaseClient | null {
  const config = getActiveSupabaseConfig();
  if (!config.isConfigured) {
    return null;
  }

  if (supabaseInstance && lastUsedUrl === config.url && lastUsedKey === config.anonKey) {
    return supabaseInstance;
  }

  try {
    supabaseInstance = createClient(config.url, config.anonKey);
    lastUsedUrl = config.url;
    lastUsedKey = config.anonKey;
    return supabaseInstance;
  } catch (err) {
    console.error('Erro ao inicializar cliente Supabase:', err);
    return null;
  }
}

export function saveSupabaseCustomCredentials(url: string, anonKey: string) {
  localStorage.setItem(URL_STORAGE_KEY, url.trim());
  localStorage.setItem(KEY_STORAGE_KEY, anonKey.trim());
  supabaseInstance = null; // force re-create
}

export function clearSupabaseCustomCredentials() {
  localStorage.removeItem(URL_STORAGE_KEY);
  localStorage.removeItem(KEY_STORAGE_KEY);
  supabaseInstance = null;
}

export function getLocalStoredChamados(): Chamado[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_CHAMADOS));
      return INITIAL_CHAMADOS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CHAMADOS;
  }
}

export function saveLocalStoredChamados(items: Chamado[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Falha ao salvar chamados localmente:', err);
  }
}

/**
 * Carrega todos os chamados. Se o Supabase estiver configurado e a tabela existir,
 * busca os dados remotos e sincroniza com o cache local.
 * Se der erro ou se não houver Supabase configurado, retorna os dados locais prontos para sincronização.
 */
export async function fetchAllChamados(): Promise<{ data: Chamado[]; isFromSupabase: boolean; errorMsg?: string }> {
  const supabase = getSupabase();
  const localData = getLocalStoredChamados();

  if (!supabase) {
    return { data: localData, isFromSupabase: false };
  }

  try {
    const { data, error } = await supabase
      .from('chamados')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return {
        data: localData,
        isFromSupabase: false,
        errorMsg: `Supabase retornou erro: ${error.message} (Verifique se a tabela 'chamados' foi criada).`
      };
    }

    if (data && Array.isArray(data)) {
      // If table is newly created and empty, optionally push our local initial data
      if (data.length === 0 && localData.length > 0) {
        // We can keep localData or leave empty
        return { data: localData, isFromSupabase: true };
      }
      saveLocalStoredChamados(data);
      return { data, isFromSupabase: true };
    }

    return { data: localData, isFromSupabase: false };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { data: localData, isFromSupabase: false, errorMsg: msg };
  }
}

/**
 * Cria um novo chamado no Supabase e no cache local
 */
export async function createChamado(novoChamado: Chamado): Promise<{ success: boolean; data: Chamado; syncedToSupabase: boolean; errorMsg?: string }> {
  // Update local immediately for zero-latency UX
  const localList = getLocalStoredChamados();
  const updatedLocal = [novoChamado, ...localList];
  saveLocalStoredChamados(updatedLocal);

  const supabase = getSupabase();
  if (!supabase) {
    return { success: true, data: novoChamado, syncedToSupabase: false };
  }

  try {
    const { data, error } = await supabase
      .from('chamados')
      .insert([novoChamado])
      .select()
      .single();

    if (error) {
      console.warn('Erro ao inserir no Supabase, mantido localmente:', error);
      return {
        success: true,
        data: novoChamado,
        syncedToSupabase: false,
        errorMsg: `Chamado salvo localmente. Aviso Supabase: ${error.message}`
      };
    }

    return { success: true, data: data || novoChamado, syncedToSupabase: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: true,
      data: novoChamado,
      syncedToSupabase: false,
      errorMsg: `Salvo localmente. Erro de rede Supabase: ${msg}`
    };
  }
}

/**
 * Atualiza um chamado (ex: mecânico inicia ou encerra)
 */
export async function updateChamado(
  id: string,
  updates: Partial<Chamado>
): Promise<{ success: boolean; data?: Chamado; syncedToSupabase: boolean; errorMsg?: string }> {
  const localList = getLocalStoredChamados();
  let updatedItem: Chamado | undefined;

  const newLocalList = localList.map((item) => {
    if (item.id === id) {
      updatedItem = {
        ...item,
        ...updates,
        updated_at: new Date().toISOString()
      };
      return updatedItem;
    }
    return item;
  });

  if (updatedItem) {
    saveLocalStoredChamados(newLocalList);
  }

  const supabase = getSupabase();
  if (!supabase || !updatedItem) {
    return { success: !!updatedItem, data: updatedItem, syncedToSupabase: false };
  }

  try {
    const { data, error } = await supabase
      .from('chamados')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return {
        success: true,
        data: updatedItem,
        syncedToSupabase: false,
        errorMsg: `Atualizado localmente. Supabase aviso: ${error.message}`
      };
    }

    return { success: true, data: data || updatedItem, syncedToSupabase: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: true,
      data: updatedItem,
      syncedToSupabase: false,
      errorMsg: `Atualizado localmente. Erro no Supabase: ${msg}`
    };
  }
}

/**
 * Testa conexão com o Supabase
 */
export async function testConnection(): Promise<{ connected: boolean; message: string; tableReady: boolean }> {
  const supabase = getSupabase();
  if (!supabase) {
    return {
      connected: false,
      message: 'Supabase não configurado. Adicione a URL e Chave Anon.',
      tableReady: false
    };
  }

  try {
    const { data, error } = await supabase
      .from('chamados')
      .select('id')
      .limit(1);

    if (error) {
      if (error.code === '42P01' || error.message.includes('relation "chamados" does not exist')) {
        return {
          connected: true,
          tableReady: false,
          message: 'Conectado ao Supabase! Porém a tabela "chamados" ainda não foi criada. Execute o script SQL abaixo no SQL Editor do Supabase.'
        };
      }
      return {
        connected: false,
        tableReady: false,
        message: `Erro ao consultar Supabase: ${error.message}`
      };
    }

    return {
      connected: true,
      tableReady: true,
      message: `Conexão estabelecida com sucesso! Tabela "chamados" ativa e sincronizada (${Array.isArray(data) ? data.length : 0} registros consultados).`
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      connected: false,
      tableReady: false,
      message: `Falha de rede ao conectar: ${msg}`
    };
  }
}

export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- SISTEMA DE CHAMADOS DE MANUTENÇÃO - SCRIPT COMPLETO SUPABASE
-- 1. Tabela de Chamados + RLS
-- 2. Bucket de Armazenamento (Storage) + Políticas de Storage (storage.objects)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- PARTE 1: TABELA DE CHAMADOS E POLÍTICAS DE BANCO DE DADOS (RLS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chamados (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  equipamento TEXT NOT NULL,
  tag_equipamento TEXT,
  setor TEXT NOT NULL,
  prioridade TEXT NOT NULL DEFAULT 'Média',
  descricao TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Aberto',
  operador TEXT NOT NULL DEFAULT 'operador',
  mecanico TEXT,
  solucao TEXT,
  pecas_utilizadas TEXT,
  tempo_gasto TEXT,
  foto_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- Ativar Row Level Security (RLS) na tabela de chamados
ALTER TABLE public.chamados ENABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas se existirem para evitar duplicidade
DROP POLICY IF EXISTS "Permitir leitura de chamados" ON public.chamados;
DROP POLICY IF EXISTS "Permitir inserção de chamados" ON public.chamados;
DROP POLICY IF EXISTS "Permitir atualização de chamados" ON public.chamados;
DROP POLICY IF EXISTS "Permitir exclusão de chamados" ON public.chamados;

-- Políticas de banco de dados
CREATE POLICY "Permitir leitura de chamados" 
  ON public.chamados FOR SELECT 
  TO public, anon, authenticated 
  USING (true);

CREATE POLICY "Permitir inserção de chamados" 
  ON public.chamados FOR INSERT 
  TO public, anon, authenticated 
  WITH CHECK (true);

CREATE POLICY "Permitir atualização de chamados" 
  ON public.chamados FOR UPDATE 
  TO public, anon, authenticated 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir exclusão de chamados" 
  ON public.chamados FOR DELETE 
  TO public, anon, authenticated 
  USING (true);

-- Habilitar Realtime na tabela de chamados
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'chamados'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chamados;
  END IF;
END $$;


-- ------------------------------------------------------------------------------
-- PARTE 2: CONFIGURAÇÃO DO BUCKET DE ARMAZENAMENTO (STORAGE)
-- Bucket: 'manutencao-arquivos' (fotos de defeitos, laudos e ordens de serviço)
-- ------------------------------------------------------------------------------

-- Criação do Bucket de Armazenamento se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'manutencao-arquivos',
  'manutencao-arquivos',
  true,
  20971520, -- Limite de 20MB por arquivo
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 20971520;

-- ------------------------------------------------------------------------------
-- PARTE 3: POLÍTICAS DE ARMAZENAMENTO (STORAGE POLICIES ON storage.objects)
-- ------------------------------------------------------------------------------

-- Remover políticas anteriores no bucket para garantir execução limpa
DROP POLICY IF EXISTS "Permitir visualização pública de arquivos do chamado" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload de fotos e laudos de manutenção" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização de arquivos de manutenção" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão de arquivos de manutenção" ON storage.objects;

-- 1. POLÍTICA DE LEITURA (SELECT): Permite visualizar/baixar fotos e laudos anexados
CREATE POLICY "Permitir visualização pública de arquivos do chamado"
  ON storage.objects FOR SELECT
  TO public, anon, authenticated
  USING (bucket_id = 'manutencao-arquivos');

-- 2. POLÍTICA DE UPLOAD (INSERT): Permite que operadores e mecânicos enviem fotos e anexos
CREATE POLICY "Permitir upload de fotos e laudos de manutenção"
  ON storage.objects FOR INSERT
  TO public, anon, authenticated
  WITH CHECK (bucket_id = 'manutencao-arquivos');

-- 3. POLÍTICA DE ATUALIZAÇÃO (UPDATE): Permite substituir arquivos existentes
CREATE POLICY "Permitir atualização de arquivos de manutenção"
  ON storage.objects FOR UPDATE
  TO public, anon, authenticated
  USING (bucket_id = 'manutencao-arquivos')
  WITH CHECK (bucket_id = 'manutencao-arquivos');

-- 4. POLÍTICA DE EXCLUSÃO (DELETE): Permite remover arquivos do bucket
CREATE POLICY "Permitir exclusão de arquivos de manutenção"
  ON storage.objects FOR DELETE
  TO public, anon, authenticated
  USING (bucket_id = 'manutencao-arquivos');
`;

