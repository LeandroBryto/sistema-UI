// Modelos específicos para Perfil

export interface PerfilUsuarioEntity {
  id?: number;
  usuarioId: number;
  nome: string;
  email: string;
  avatar?: string;
  bio?: string;
  dataNascimento?: Date;
  nivel: number;
  xpTotal: number;
  xpAtual: number;
  streakAtual: number;
  melhorStreak: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PerfilRequestDTO {
  nome?: string;
  bio?: string;
  dataNascimento?: Date;
  avatar?: string;
}

export interface PerfilResponseDTO {
  id: number;
  usuarioId: number;
  nome: string;
  email: string;
  avatar?: string;
  bio?: string;
  dataNascimento?: Date;
  nivel: number;
  xpTotal: number;
  xpAtual: number;
  streakAtual: number;
  melhorStreak: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EstatisticasPerfil {
  nivelAtual: number;
  xpAtual: number;
  xpParaProximoNivel: number;
  xpTotalGanho: number;
  streakAtual: number;
  melhorStreak: number;
  diasEstudados: number;
  horasTotaisEstudo: number;
  flashcardsCriados: number;
  flashcardsRevisados: number;
  eventosCriados: number;
  eventosConcluidos: number;
  taxaConclusaoEventos: number;
  materiasAtivas: number;
}

export interface Achievement {
  id: string;
  titulo: string;
  descricao: string;
  icone: string;
  categoria: CategoriaAchievement;
  criterio: {
    tipo: TipoCriterio;
    valor: number;
    valorAtual?: number;
  };
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: Date;
  progresso?: number; // 0-100
}

export interface ConquistaResponseDTO {
  id: number;
  usuarioId: number;
  achievementId: string;
  titulo: string;
  descricao: string;
  icone: string;
  categoria: CategoriaAchievement;
  xpGanho: number;
  dataConquista: Date;
}

export interface ProgressoDiario {
  data: Date;
  xpGanho: number;
  minutosEstudo: number;
  flashcardsRevisados: number;
  eventosConcluidos: number;
  streakMantido: boolean;
}

export interface HistoricoAtividade {
  data: Date;
  atividades: Atividade[];
  xpTotalDia: number;
  minutosTotais: number;
}

export interface Atividade {
  id: string;
  tipo: TipoAtividade;
  titulo: string;
  descricao: string;
  xpGanho: number;
  data: Date;
  metadata?: any;
}

export interface ConfiguracaoPerfil {
  notificacoesAtivadas: boolean;
  notificacoesEmail: boolean;
  tema: 'light' | 'dark' | 'auto';
  idioma: string;
  privacidade: {
    mostrarProgresso: boolean;
    mostrarConquistas: boolean;
    mostrarEstatisticas: boolean;
  };
  lembretes: {
    estudo: boolean;
    revisao: boolean;
    eventos: boolean;
  };
  objetivos: {
    diario: {
      minutosEstudo: number;
      flashcardsRevisao: number;
      eventosConclusao: number;
    };
    semanal: {
      minutosEstudo: number;
      flashcardsRevisao: number;
      eventosConclusao: number;
    };
  };
}

// Nova interface para o perfil completo conforme documentação
export interface PerfilCompletoResponse {
  resumo: {
    id: number;
    nivel: number;
    xp: number;
    moedas: number;
    ofensiva: number;
    avatar: string;
    totalMinutos: number;
    totalSessoes: number;
    totalConquistas: number;
  };
  ultimasConquistas: Array<{
    id: number;
    nome: string;
    descricao: string;
    icone: string;
    dataConquista: string;
  }>;
}

// Enums
export enum CategoriaAchievement {
  ESTUDO = 'ESTUDO',
  FLASHCARDS = 'FLASHCARDS',
  AGENDA = 'AGENDA',
  STREAK = 'STREAK',
  SOCIAL = 'SOCIAL',
  ESPECIAL = 'ESPECIAL'
}

export enum TipoCriterio {
  MINUTOS_ESTUDO = 'MINUTOS_ESTUDO',
  SESSOES_ESTUDO = 'SESSOES_ESTUDO',
  FLASHCARDS_CRIADOS = 'FLASHCARDS_CRIADOS',
  FLASHCARDS_REVISADOS = 'FLASHCARDS_REVISADOS',
  STREAK_DIAS = 'STREAK_DIAS',
  EVENTOS_CONCLUIDOS = 'EVENTOS_CONCLUIDOS',
  MATERIAS_ATIVAS = 'MATERIAS_ATIVAS',
  NIVEL_ALCANCADO = 'NIVEL_ALCANCADO',
  XP_TOTAL = 'XP_TOTAL'
}

export enum TipoAtividade {
  SESSAO_ESTUDO = 'SESSAO_ESTUDO',
  FLASHCARD_CRIADO = 'FLASHCARD_CRIADO',
  FLASHCARD_REVISADO = 'FLASHCARD_REVISADO',
  EVENTO_CONCLUIDO = 'EVENTO_CONCLUIDO',
  CONQUISTA_DESBLOQUEADA = 'CONQUISTA_DESBLOQUEADA',
  NIVEL_ALCANCADO = 'NIVEL_ALCANCADO'
}

// Interfaces para gamificação
export interface SistemaGamificacao {
  nivelAtual: number;
  xpAtual: number;
  xpParaProximoNivel: number;
  xpTotal: number;
  multiplicadorXp: number;
  bonusAtivo?: {
    tipo: string;
    multiplicador: number;
    tempoRestante: number;
  };
}

export interface RankingUsuario {
  posicao: number;
  usuarioId: number;
  nome: string;
  avatar?: string;
  nivel: number;
  xpTotal: number;
  pontosSemana: number;
  pontosMes: number;
}

export interface Leaderboard {
  semanal: RankingUsuario[];
  mensal: RankingUsuario[];
  geral: RankingUsuario[];
  minhaPosicao: {
    semanal: number;
    mensal: number;
    geral: number;
  };
}

// Interfaces para metas e objetivos
export interface Meta {
  id: string;
  titulo: string;
  descricao: string;
  tipo: TipoMeta;
  objetivo: number;
  progresso: number;
  prazo?: Date;
  status: StatusMeta;
  xpReward: number;
  createdAt: Date;
}

export interface MetaRequestDTO {
  titulo: string;
  descricao: string;
  tipo: TipoMeta;
  objetivo: number;
  prazo?: Date;
}

export enum TipoMeta {
  MINUTOS_ESTUDO_DIARIO = 'MINUTOS_ESTUDO_DIARIO',
  MINUTOS_ESTUDO_SEMANAL = 'MINUTOS_ESTUDO_SEMANAL',
  FLASHCARDS_REVISAR_DIARIO = 'FLASHCARDS_REVISAR_DIARIO',
  FLASHCARDS_REVISAR_SEMANAL = 'FLASHCARDS_REVISAR_SEMANAL',
  EVENTOS_CONCLUIR_SEMANAL = 'EVENTOS_CONCLUIR_SEMANAL',
  STREAK_MANTTER = 'STREAK_MANTTER',
  NIVEL_ALCANCAR = 'NIVEL_ALCANCAR'
}

export enum StatusMeta {
  ATIVA = 'ATIVA',
  CONCLUIDA = 'CONCLUIDA',
  EXPIRADA = 'EXPIRADA',
  CANCELADA = 'CANCELADA'
}

// Interfaces para relatórios de progresso
export interface RelatorioProgresso {
  periodo: string;
  progressoGeral: {
    xpGanho: number;
    minutosEstudo: number;
    flashcardsRevisados: number;
    eventosConcluidos: number;
  };
  progressoDiario: ProgressoDiario[];
  conquistasDesbloqueadas: ConquistaResponseDTO[];
  metasConcluidas: Meta[];
  comparacaoPeriodoAnterior: {
    xpGanho: number;
    minutosEstudo: number;
    flashcardsRevisados: number;
    eventosConcluidos: number;
  };
}

// DTOs para atualização
export interface AtualizarPerfilDTO {
  nome?: string;
  bio?: string;
  dataNascimento?: Date;
  avatar?: string;
}

export interface AtualizarConfiguracaoDTO {
  notificacoesAtivadas?: boolean;
  notificacoesEmail?: boolean;
  tema?: 'light' | 'dark' | 'auto';
  idioma?: string;
  privacidade?: {
    mostrarProgresso?: boolean;
    mostrarConquistas?: boolean;
    mostrarEstatisticas?: boolean;
  };
  lembretes?: {
    estudo?: boolean;
    revisao?: boolean;
    eventos?: boolean;
  };
  objetivos?: {
    diario?: {
      minutosEstudo?: number;
      flashcardsRevisao?: number;
      eventosConclusao?: number;
    };
    semanal?: {
      minutosEstudo?: number;
      flashcardsRevisao?: number;
      eventosConclusao?: number;
    };
  };
}