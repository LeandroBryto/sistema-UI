// Modelos específicos para Flashcards

export interface FlashcardEntity {
  id?: number;
  usuarioId: number;
  materiaId: number;
  pergunta: string;
  resposta: string;
  dificuldade: Dificuldade;
  status: FlashcardStatus;
  dataCriacao: Date;
  dataRevisao?: Date;
  proximaRevisao: Date;
  intervaloRevisao: number; // dias
  repeticoes: number;
  facilidade: number; // Fator de facilidade (EF)
  createdAt: Date;
  updatedAt: Date;
}

export interface FlashcardRequestDTO {
  materiaId: number;
  pergunta: string;
  resposta: string;
  dificuldade?: Dificuldade;
}

export interface FlashcardResponseDTO {
  id: number;
  usuarioId: number;
  materiaId: number;
  materiaNome: string;
  pergunta: string;
  resposta: string;
  dificuldade: Dificuldade;
  status: FlashcardStatus;
  dataCriacao: Date;
  dataRevisao?: Date;
  proximaRevisao: Date;
  intervaloRevisao: number;
  repeticoes: number;
  facilidade: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlashcardRevisaoDTO {
  flashcardId: number;
  qualidade: QualidadeResposta; // 0-5
  tempoResposta?: number; // segundos
}

export interface DeckFlashcards {
  materiaId: number;
  materiaNome: string;
  flashcards: FlashcardResponseDTO[];
  totalCards: number;
  cardsParaRevisar: number;
  cardsNovos: number;
  progresso: number; // 0-100
}

export interface SessaoRevisao {
  id?: string;
  materiaId: number;
  flashcards: FlashcardResponseDTO[];
  cardAtual: number;
  totalCards: number;
  cardsRevisados: number;
  tempoInicio: Date;
  tempoTotal: number; // segundos
  status: 'ATIVA' | 'FINALIZADA' | 'PAUSADA';
}

export interface EstatisticasFlashcard {
  totalFlashcards: number;
  flashcardsRevisados: number;
  taxaAcerto: number; // 0-100
  streakAtual: number;
  melhorStreak: number;
  tempoMedioResposta: number; // segundos
  distribuicaoDificuldade: {
    facil: number;
    medio: number;
    dificil: number;
  };
  progressoMaterias: {
    materiaId: number;
    materiaNome: string;
    progresso: number;
  }[];
}

// Enums
export enum Dificuldade {
  FACIL = 'FACIL',
  MEDIO = 'MEDIO',
  DIFICIL = 'DIFICIL'
}

export enum FlashcardStatus {
  NOVO = 'NOVO',
  APRENDENDO = 'APRENDENDO',
  REVISAO = 'REVISAO',
  DOMINADO = 'DOMINADO'
}

export enum QualidadeResposta {
  TOTALMENTE_ESQUECIDO = 0,
  INCORRETO_COM_DIFICULDADE = 1,
  INCORRETO_COM_ESFORCO = 2,
  CORRETO_COM_DIFICULDADE = 3,
  CORRETO_COM_ESFORCO = 4,
  PERFEITO = 5
}

// Tipos utilitários
export interface FlashcardFilter {
  materiaId?: number;
  dificuldade?: Dificuldade;
  status?: FlashcardStatus;
  dataInicio?: Date;
  dataFim?: Date;
}

export interface FlashcardSort {
  campo: 'dataCriacao' | 'dataRevisao' | 'proximaRevisao' | 'dificuldade';
  ordem: 'asc' | 'desc';
}

export interface RevisaoStats {
  totalRevisoes: number;
  tempoTotal: number;
  qualidadeMedia: number;
  cardsDominados: number;
  cardsAprendendo: number;
}

// Interfaces para configurações
export interface FlashcardConfig {
  limiteNovosPorDia: number;
  limiteRevisoesPorDia: number;
  intervaloMinimo: number; // dias
  intervaloMaximo: number; // dias
  mostrarRespostaAutomaticamente: boolean;
  tempoLimiteResposta?: number; // segundos
  algoritmo: 'leitner' | 'sm2';
}

// DTOs para operações em lote
export interface CriarFlashcardsLoteDTO {
  materiaId: number;
  flashcards: {
    pergunta: string;
    resposta: string;
    dificuldade?: Dificuldade;
  }[];
}

export interface RevisarFlashcardsLoteDTO {
  revisoes: {
    flashcardId: number;
    qualidade: QualidadeResposta;
    tempoResposta?: number;
  }[];
}

// Interfaces para gamificação
export interface AchievementFlashcard {
  id: string;
  titulo: string;
  descricao: string;
  icone: string;
  criterio: {
    tipo: 'cards_criados' | 'cards_revisados' | 'streak' | 'taxa_acerto';
    valor: number;
  };
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface GamificationFlashcard {
  nivelAtual: number;
  xpAtual: number;
  xpParaProximoNivel: number;
  achievements: AchievementFlashcard[];
  streakRevisao: number;
  melhorStreak: number;
  cardsCriados: number;
  cardsRevisados: number;
}