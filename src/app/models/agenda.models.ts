// Modelos específicos para Agenda

export interface EventoEntity {
  id?: number;
  usuarioId: number;
  titulo: string;
  descricao?: string;
  dataInicio: Date;
  dataFim: Date;
  tipo: TipoEvento;
  prioridade: Prioridade;
  status: StatusEvento;
  materiaId?: number;
  recorrencia?: Recorrencia;
  lembrete?: number; // minutos antes do evento
  local?: string;
  cor?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventoRequestDTO {
  titulo: string;
  descricao?: string;
  dataInicio: Date;
  dataFim: Date;
  tipo: TipoEvento;
  prioridade?: Prioridade;
  materiaId?: number;
  recorrencia?: Recorrencia;
  lembrete?: number;
  local?: string;
  cor?: string;
}

export interface EventoResponseDTO {
  id: number;
  usuarioId: number;
  titulo: string;
  descricao?: string;
  dataInicio: Date;
  dataFim: Date;
  tipo: TipoEvento;
  prioridade: Prioridade;
  status: StatusEvento;
  materiaId?: number;
  materiaNome?: string;
  recorrencia?: Recorrencia;
  lembrete?: number;
  local?: string;
  cor?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgendaDia {
  data: Date;
  eventos: EventoResponseDTO[];
  totalEventos: number;
  eventosEstudo: number;
  eventosProva: number;
  eventosTarefa: number;
}

export interface AgendaSemana {
  semanaInicio: Date;
  semanaFim: Date;
  dias: AgendaDia[];
  totalEventos: number;
  cargaEstudo: number; // horas
}

export interface AgendaMes {
  mes: number;
  ano: number;
  dias: AgendaDia[];
  eventosPorDia: { [data: string]: number };
  totalEventos: number;
}

export interface EstatisticasAgenda {
  totalEventos: number;
  eventosEsteMes: number;
  eventosEstaSemana: number;
  eventosHoje: number;
  horasEstudoPlanejadas: number;
  horasEstudoRealizadas: number;
  taxaConclusao: number; // 0-100
  distribuicaoTipos: {
    estudo: number;
    prova: number;
    tarefa: number;
    reuniao: number;
    outro: number;
  };
  distribuicaoPrioridades: {
    baixa: number;
    media: number;
    alta: number;
    urgente: number;
  };
}

// Enums
export enum TipoEvento {
  ESTUDO = 'ESTUDO',
  PROVA = 'PROVA',
  TAREFA = 'TAREFA',
  REUNIAO = 'REUNIAO',
  OUTRO = 'OUTRO'
}

export enum Prioridade {
  BAIXA = 'BAIXA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  URGENTE = 'URGENTE'
}

export enum StatusEvento {
  PENDENTE = 'PENDENTE',
  CONFIRMADO = 'CONFIRMADO',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO'
}

export enum Recorrencia {
  NENHUMA = 'NENHUMA',
  DIARIA = 'DIARIA',
  SEMANAL = 'SEMANAL',
  MENSAL = 'MENSAL',
  ANUAL = 'ANUAL'
}

// Tipos utilitários
export interface EventoFilter {
  dataInicio?: Date;
  dataFim?: Date;
  tipo?: TipoEvento;
  prioridade?: Prioridade;
  status?: StatusEvento;
  materiaId?: number;
}

export interface EventoSort {
  campo: 'dataInicio' | 'dataFim' | 'titulo' | 'prioridade' | 'tipo';
  ordem: 'asc' | 'desc';
}

export interface CalendarioConfig {
  vistaPadrao: 'mes' | 'semana' | 'dia' | 'agenda';
  horaInicio: number; // 0-23
  horaFim: number; // 0-23
  mostrarFinsDeSemana: boolean;
  tema: 'light' | 'dark';
  notificacoesAtivadas: boolean;
  lembretePadrao: number; // minutos
}

// DTOs para operações
export interface AtualizarEventoDTO {
  titulo?: string;
  descricao?: string;
  dataInicio?: Date;
  dataFim?: Date;
  tipo?: TipoEvento;
  prioridade?: Prioridade;
  status?: StatusEvento;
  recorrencia?: Recorrencia;
  lembrete?: number;
  local?: string;
  cor?: string;
}

export interface MoverEventoDTO {
  dataInicio: Date;
  dataFim: Date;
}

export interface CriarEventoLoteDTO {
  eventos: EventoRequestDTO[];
}

// Interfaces para lembretes e notificações
export interface Lembrete {
  id: string;
  eventoId: number;
  titulo: string;
  mensagem: string;
  dataLembrete: Date;
  minutosAntes: number;
  notificado: boolean;
}

export interface NotificacaoEvento {
  id: string;
  eventoId: number;
  tipo: 'lembrete' | 'inicio' | 'atraso';
  titulo: string;
  mensagem: string;
  dataCriacao: Date;
  lida: boolean;
}

// Interfaces para relatórios
export interface RelatorioPeriodo {
  periodo: string;
  eventosTotais: number;
  eventosConcluidos: number;
  taxaConclusao: number;
  horasPlanejadas: number;
  horasRealizadas: number;
  distribuicaoMaterias: {
    materiaId: number;
    materiaNome: string;
    eventos: number;
    horas: number;
  }[];
}

export interface RelatorioComparativo {
  periodoAtual: RelatorioPeriodo;
  periodoAnterior: RelatorioPeriodo;
  variacaoEventos: number;
  variacaoConclusao: number;
  variacaoHoras: number;
}

// Interfaces para integração com outras telas
export interface EventoEstudo {
  eventoId: number;
  materiaId: number;
  materiaNome: string;
  titulo: string;
  dataInicio: Date;
  duracao: number; // minutos
  prioridade: Prioridade;
  concluido: boolean;
}

export interface CronogramaEstudo {
  materiaId: number;
  materiaNome: string;
  eventos: EventoEstudo[];
  horasTotais: number;
  horasConcluidas: number;
  progresso: number; // 0-100
}

// Modelos para Agenda Simples (itens semanais)
export interface ItemAgendaEntity {
  id?: number;
  materiaId: number;
  diaSemana: DiaSemana;
  horarioInicio: string;
  horarioFim: string;
}

export interface AgendaResponseDTO {
  id: number;
  nomeMateria: string;
  corMateria: string;
  diaSemana: string; // "MONDAY", "TUESDAY", etc.
  horarioInicio: string; // "08:00:00"
  horarioFim: string; // "10:00:00"
  observacao?: string;
}

export interface CriarItemAgendaRequest {
  materiaId: number;
  diaSemana: DiaSemana;
  horarioInicio: string;
  horarioFim: string;
  titulo?: string;
  descricao?: string;
  observacao?: string;
}

// Enums necessários
export enum DiaSemana {
  DOMINGO = 'DOMINGO',
  SEGUNDA = 'SEGUNDA',
  TERCA = 'TERCA',
  QUARTA = 'QUARTA',
  QUINTA = 'QUINTA',
  SEXTA = 'SEXTA',
  SABADO = 'SABADO'
}