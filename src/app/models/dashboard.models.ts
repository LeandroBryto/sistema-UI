// Modelos específicos para Dashboard

export interface DashboardData {
  resumoGeral: ResumoGeral;
  atividadesRecentes: AtividadeRecente[];
  progressoSemanal: ProgressoSemanal;
  metasAtuais: MetaAtual[];
  estatisticasRapidas: EstatisticaRapida[];
  proximasAtividades: ProximaAtividade[];
  notificacoes: Notificacao[];
}

export interface ResumoGeral {
  nivelAtual: number;
  xpAtual: number;
  xpParaProximoNivel: number;
  streakAtual: number;
  horasEstudoHoje: number;
  flashcardsRevisadosHoje: number;
  eventosPendentes: number;
  conquistasRecentes: number;
}

export interface AtividadeRecente {
  id: string;
  tipo: TipoAtividadeDashboard;
  titulo: string;
  descricao: string;
  data: Date;
  xpGanho?: number;
  icone: string;
  cor: string;
}

export interface ProgressoSemanal {
  semanaAtual: Date;
  dias: ProgressoDia[];
  totalXpGanho: number;
  totalMinutosEstudo: number;
  metaSemanalAlcancada: boolean;
  comparacaoSemanaAnterior: {
    xpGanho: number;
    minutosEstudo: number;
    variacaoPercentual: number;
  };
}

export interface ProgressoDia {
  data: Date;
  xpGanho: number;
  minutosEstudo: number;
  flashcardsRevisados: number;
  eventosConcluidos: number;
  metaDiariaAlcancada: boolean;
  atividades: AtividadeRecente[];
}

export interface MetaAtual {
  id: string;
  titulo: string;
  tipo: TipoMetaDashboard;
  progressoAtual: number;
  progressoTotal: number;
  porcentagem: number;
  prazo?: Date;
  status: StatusMetaDashboard;
  cor: string;
}

export interface EstatisticaRapida {
  titulo: string;
  valor: string | number;
  unidade: string;
  icone: string;
  cor: string;
  tendencia?: {
    valor: number;
    direcao: 'up' | 'down' | 'stable';
    periodo: string;
  };
}

export interface ProximaAtividade {
  id: number;
  tipo: TipoAtividadeDashboard;
  titulo: string;
  descricao: string;
  dataInicio: Date;
  dataFim?: Date;
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  materiaNome?: string;
  tempoRestante?: number; // minutos até o início
  status: 'pendente' | 'em_andamento' | 'atrasada';
}

export interface Notificacao {
  id: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  data: Date;
  lida: boolean;
  acao?: {
    texto: string;
    rota: string;
    parametros?: any;
  };
}

// Enums
export enum TipoAtividadeDashboard {
  SESSAO_ESTUDO = 'SESSAO_ESTUDO',
  FLASHCARD_CRIADO = 'FLASHCARD_CRIADO',
  FLASHCARD_REVISADO = 'FLASHCARD_REVISADO',
  EVENTO_CRIADO = 'EVENTO_CRIADO',
  EVENTO_CONCLUIDO = 'EVENTO_CONCLUIDO',
  CONQUISTA_DESBLOQUEADA = 'CONQUISTA_DESBLOQUEADA',
  NIVEL_ALCANCADO = 'NIVEL_ALCANCADO',
  META_CONCLUIDA = 'META_CONCLUIDA'
}

export enum TipoMetaDashboard {
  MINUTOS_ESTUDO_DIARIO = 'MINUTOS_ESTUDO_DIARIO',
  MINUTOS_ESTUDO_SEMANAL = 'MINUTOS_ESTUDO_SEMANAL',
  FLASHCARDS_REVISAR_DIARIO = 'FLASHCARDS_REVISAR_DIARIO',
  FLASHCARDS_REVISAR_SEMANAL = 'FLASHCARDS_REVISAR_SEMANAL',
  EVENTOS_CONCLUIR_SEMANAL = 'EVENTOS_CONCLUIR_SEMANAL',
  STREAK_MANTTER = 'STREAK_MANTTER'
}

export enum StatusMetaDashboard {
  ATIVA = 'ATIVA',
  CONCLUIDA = 'CONCLUIDA',
  EXPIRADA = 'EXPIRADA',
  PAUSADA = 'PAUSADA'
}

export enum TipoNotificacao {
  LEMBRETE_ESTUDO = 'LEMBRETE_ESTUDO',
  LEMBRETE_REVISAO = 'LEMBRETE_REVISAO',
  LEMBRETE_EVENTO = 'LEMBRETE_EVENTO',
  CONQUISTA_DESBLOQUEADA = 'CONQUISTA_DESBLOQUEADA',
  NIVEL_ALCANCADO = 'NIVEL_ALCANCADO',
  META_CONCLUIDA = 'META_CONCLUIDA',
  STREAK_PERDIDO = 'STREAK_PERDIDO',
  SISTEMA = 'SISTEMA'
}

// Interfaces para widgets do dashboard
export interface WidgetConfig {
  id: string;
  tipo: TipoWidget;
  titulo: string;
  posicao: { x: number; y: number; w: number; h: number };
  configuracao: any;
  visivel: boolean;
}

export enum TipoWidget {
  RESUMO_GERAL = 'RESUMO_GERAL',
  PROGRESSO_SEMANAL = 'PROGRESSO_SEMANAL',
  ATIVIDADES_RECENTES = 'ATIVIDADES_RECENTES',
  METAS_ATUAIS = 'METAS_ATUAIS',
  PROXIMAS_ATIVIDADES = 'PROXIMAS_ATIVIDADES',
  ESTATISTICAS_RAPIDAS = 'ESTATISTICAS_RAPIDAS',
  GRAFICO_PROGRESSO = 'GRAFICO_PROGRESSO',
  CALENDARIO_SEMANAL = 'CALENDARIO_SEMANAL'
}

// Interfaces para gráficos e visualizações
export interface GraficoProgresso {
  tipo: 'linha' | 'barra' | 'area';
  dados: PontoGrafico[];
  metrica: string;
  periodo: string;
  cor: string;
}

export interface PontoGrafico {
  data: Date;
  valor: number;
  label?: string;
  meta?: number;
}

export interface CalendarioSemanal {
  semana: Date;
  dias: DiaCalendario[];
}

export interface DiaCalendario {
  data: Date;
  atividades: {
    sessoesEstudo: number;
    flashcardsRevisados: number;
    eventos: number;
  };
  totalMinutos: number;
  temAtividades: boolean;
}

// Interfaces para filtros e personalização
export interface DashboardFilters {
  periodo: 'hoje' | 'semana' | 'mes' | 'ano';
  materiaId?: number;
  tipoAtividade?: TipoAtividadeDashboard;
  dataInicio?: Date;
  dataFim?: Date;
}

export interface DashboardConfig {
  widgetsVisiveis: string[];
  layout: WidgetConfig[];
  tema: 'light' | 'dark';
  atualizacaoAutomatica: boolean;
  intervaloAtualizacao: number; // minutos
  notificacoesAtivadas: boolean;
}

// DTOs para operações
export interface AtualizarDashboardDTO {
  widgets?: WidgetConfig[];
  config?: Partial<DashboardConfig>;
}

export interface MarcarNotificacaoLidaDTO {
  notificacaoId: string;
}

// Interfaces para dados agregados
export interface DadosAgregados {
  periodo: string;
  resumo: {
    totalXpGanho: number;
    totalMinutosEstudo: number;
    totalFlashcardsRevisados: number;
    totalEventosConcluidos: number;
    mediaDiaria: {
      xp: number;
      minutos: number;
      flashcards: number;
      eventos: number;
    };
  };
  tendencias: {
    xpGanho: number; // variação percentual
    minutosEstudo: number;
    produtividade: number;
  };
  distribuicaoMaterias: {
    materiaId: number;
    materiaNome: string;
    minutosEstudo: number;
    porcentagem: number;
  }[];
  comparacaoPeriodos: {
    periodoAtual: string;
    periodoAnterior: string;
    variacao: {
      xpGanho: number;
      minutosEstudo: number;
      produtividade: number;
    };
  };
}

// Interfaces para recomendações
export interface Recomendacao {
  id: string;
  tipo: TipoRecomendacao;
  titulo: string;
  descricao: string;
  prioridade: 'baixa' | 'media' | 'alta';
  acao?: {
    texto: string;
    rota: string;
    parametros?: any;
  };
  dados?: any;
}

export enum TipoRecomendacao {
  ESTUDAR_MATERIA = 'ESTUDAR_MATERIA',
  REVISAR_FLASHCARDS = 'REVISAR_FLASHCARDS',
  CONCLUIR_EVENTO = 'CONCLUIR_EVENTO',
  MANTER_STREAK = 'MANTER_STREAK',
  CRIAR_FLASHCARDS = 'CRIAR_FLASHCARDS',
  DEFINIR_METAS = 'DEFINIR_METAS'
}