// Modelos específicos para a tela de Modo Foco

export interface SessaoRequestDTO {
  materiaId: number;
  dataInicio: Date;
  dataFim: Date;
  anotacoes?: string;
}

export interface SessaoResponseDTO {
  id: number;
  usuarioUsername: string;
  materia: {
    id: number;
    nome: string;
    corHex: string;
  };
  dataInicio: Date;
  dataFim: Date;
  minutosTotais: number;
  xpGanho: number;
  anotacoes?: string;
}

export interface TimerConfig {
  duracaoPadrao: number; // minutos
  intervaloDescanso: number; // minutos
  sessoesPorCiclo: number;
}

export interface SessaoAtiva {
  id?: number;
  materiaId: number;
  materiaNome: string;
  tempoRestante: number; // segundos
  isRunning: boolean;
  isPaused: boolean;
  anotacoes: string;
  dataInicio: Date;
}

export interface SessaoStats {
  totalSessoes: number;
  minutosTotais: number;
  xpTotalGanho: number;
  diasEstudados: number;
  sequenciaAtual: number;
}

// Tipos para o timer
export type TimerState = 'idle' | 'running' | 'paused' | 'finished';

export interface TimerEvent {
  type: 'start' | 'pause' | 'resume' | 'finish' | 'tick';
  data?: any;
}

// Tipos utilitários adicionais
export interface TimerDisplay {
  minutos: string;
  segundos: string;
  progresso: number; // 0-100
}

export interface SessaoHistorico {
  data: Date;
  sessoes: SessaoResponseDTO[];
  minutosTotais: number;
  xpGanho: number;
}

export interface CicloPomodoro {
  sessoesCompletadas: number;
  sessoesRestantes: number;
  emDescanso: boolean;
  tempoDescansoRestante?: number;
}

// Enums para status
export enum SessaoStatus {
  ATIVA = 'ATIVA',
  FINALIZADA = 'FINALIZADA',
  CANCELADA = 'CANCELADA'
}

export enum TimerStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  FINISHED = 'finished'
}

// Interfaces para configurações do usuário
export interface ModoFocoConfig {
  timerConfig: TimerConfig;
  notificacoesAtivadas: boolean;
  somAtivado: boolean;
  tema: 'light' | 'dark';
  idioma: string;
}

// DTOs para atualização
export interface AtualizarSessaoDTO {
  anotacoes?: string;
  status?: SessaoStatus;
}

export interface FinalizarSessaoDTO {
  minutosTotais: number;
  anotacoes?: string;
}

// Tipos para eventos do timer
export interface TimerTickEvent {
  tempoRestante: number;
  progresso: number;
}

export interface TimerFinishEvent {
  sessao: SessaoResponseDTO;
  xpGanho: number;
  tempoTotal: number;
}

// Interfaces para gamificação
export interface Achievement {
  id: string;
  titulo: string;
  descricao: string;
  icone: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface GamificationStats {
  nivelAtual: number;
  xpAtual: number;
  xpParaProximoNivel: number;
  achievements: Achievement[];
  streakAtual: number;
  melhorStreak: number;
}