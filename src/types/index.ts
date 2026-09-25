export type UserRole = 'operador' | 'mecanico';

export interface User {
  username: string;
  name: string;
  role: UserRole;
  badgeId: string;
}

export type Prioridade = 'Baixa' | 'Média' | 'Alta' | 'Crítica';

export type StatusChamado = 'Aberto' | 'Em Atendimento' | 'Encerrado';

export interface Chamado {
  id: string;
  titulo: string;
  equipamento: string;
  tag_equipamento?: string;
  setor: string;
  prioridade: Prioridade;
  descricao: string;
  status: StatusChamado;
  operador: string;
  mecanico?: string;
  solucao?: string;
  pecas_utilizadas?: string;
  tempo_gasto?: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}
