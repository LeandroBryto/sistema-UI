// Modelos para o Sistema de Estudos - Baseados na documentação fornecida

export interface DadosGamificacaoEntity {
  nivelAtual: number;
  xpTotal: number;
  moedasNexus: number;
  ofensivaAtual: number; // dias seguidos estudando
  avatarUrlEquipado?: string;
}

export interface GamificacaoResponseDTO {
  nivelAtual: number;
  xpTotal: number;
  moedasNexus: number;
  ofensivaAtual: number;
  avatarUrlEquipado?: string;
}

// Modelos atualizados baseados no backend Java

export interface MateriaEntity {
  id?: number;
  usuarioUsername: string;
  nome: string;
  descricao?: string;
  corHex: string;
  icone: string;
  arquivada: boolean;
  dataCriacao?: Date;
}

export interface MateriaRequestDTO {
  nome: string;
  descricao?: string;
  corHex: string;
  icone: string;
}

export interface MateriaResponseDTO {
  id: number;
  nome: string;
  descricao?: string;
  corHex: string;
  icone: string;
  arquivada: boolean;
  quantidadeTopicos: number;
  dataCriacao?: Date;
}

export interface TopicoEntity {
  id?: number;
  nome: string;
  concluido: boolean;
  materiaId: number;
  ordem?: number;
  dataCriacao?: Date;
}

export interface SessaoEstudoEntity {
  id?: number;
  materiaId: number;
  minutosTotais: number;
  anotacoes: string;
  dataInicio: Date;
  dataFim?: Date;
  xpGanho?: number;
  usuarioId?: number;
}

export interface FlashcardEntity {
  id?: number;
  pergunta: string;
  resposta: string;
  materiaId: number;
  ultimaDificuldade: DificuldadeFlashcard;
  dataProximaRevisao: Date;
  vezesRevisado: number;
  usuarioId?: number;
  dataCriacao?: Date;
}

export interface ItemAgendaEntity {
  id?: number;
  materiaId: number;
  diaSemana: DiaSemana;
  horarioInicio: string; // formato HH:mm
  horarioFim: string; // formato HH:mm
  titulo?: string;
  descricao?: string;
  observacao?: string;
  usuarioId?: number;
  dataCriacao?: Date;
}

export enum DiaSemana {
  DOMINGO = 'DOMINGO',
  SEGUNDA = 'SEGUNDA',
  TERCA = 'TERCA',
  QUARTA = 'QUARTA',
  QUINTA = 'QUINTA',
  SEXTA = 'SEXTA',
  SABADO = 'SABADO'
}

// DTOs para requests/responses
export interface CriarMateriaRequest {
  nome: string;
  corHex: string;
  icone: string;
}

export interface CriarTopicoRequest {
  nome: string;
  materiaId: number;
}

export interface CriarSessaoRequest {
  materiaId: number;
  minutosTotais: number;
  anotacoes: string;
}

export interface CriarFlashcardRequest {
  pergunta: string;
  resposta: string;
  materiaId: number;
}

export interface AvaliarFlashcardRequest {
  flashcardId: number;
  dificuldade: DificuldadeFlashcard;
}

// Responses
export interface SessaoResponse {
  sessao: SessaoEstudoEntity;
  xpGanho: number;
  nivelAtual: number;
}

export interface DashboardResponse {
  gamificacao: DadosGamificacaoEntity;
  agendaHoje: ItemAgendaEntity[];
  progressoSemanal: {
    diasEstudados: number;
    minutosTotais: number;
    flashcardsRevisados: number;
  };
}

// Flashcards
export interface FlashcardRequestDTO {
  pergunta: string;
  resposta: string;
  materiaId: number;
}

export interface FlashcardResponseDTO {
  id: number;
  pergunta: string;
  resposta: string;
  materiaNome: string;
  ultimaDificuldade: DificuldadeFlashcard;
  proximaRevisao: Date;
  dataCriacao: Date;
}

export interface RevisaoFlashcardDTO {
  dificuldade: DificuldadeFlashcard;
}

export enum DificuldadeFlashcard {
  NAOVISTO = 'NAOVISTO',
  ERROU = 'ERROU',
  DIFICIL = 'DIFICIL',
  BOM = 'BOM',
  FACIL = 'FACIL'
}