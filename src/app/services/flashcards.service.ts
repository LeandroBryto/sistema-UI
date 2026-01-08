import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, map, combineLatest } from 'rxjs';
import { EnvService } from './env.service';

// Importando os modelos específicos
import {
  FlashcardEntity,
  FlashcardRequestDTO,
  FlashcardResponseDTO,
  FlashcardRevisaoDTO,
  DeckFlashcards,
  SessaoRevisao,
  EstatisticasFlashcard,
  Dificuldade,
  FlashcardStatus,
  QualidadeResposta,
  FlashcardFilter,
  FlashcardSort,
  FlashcardConfig,
  CriarFlashcardsLoteDTO,
  RevisarFlashcardsLoteDTO,
  GamificationFlashcard
} from '../models/flashcards.models';

@Injectable({
  providedIn: 'root'
})
export class FlashcardsService {

  private config: FlashcardConfig = {
    limiteNovosPorDia: 20,
    limiteRevisoesPorDia: 100,
    intervaloMinimo: 1,
    intervaloMaximo: 365,
    mostrarRespostaAutomaticamente: false,
    tempoLimiteResposta: 30,
    algoritmo: 'sm2'
  };

  private sessaoAtualSubject = new BehaviorSubject<SessaoRevisao | null>(null);
  private statsSubject = new BehaviorSubject<EstatisticasFlashcard | null>(null);

  public sessaoAtual$ = this.sessaoAtualSubject.asObservable();
  public stats$ = this.statsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private env: EnvService
  ) { }

  private getApiUrl(): string {
    return `${this.env.apiEstudosBase()}/api/v1/flashcards`;
  }

  // CRUD Flashcards
  criarFlashcard(request: FlashcardRequestDTO): Observable<FlashcardResponseDTO> {
    return this.http.post<FlashcardResponseDTO>(this.getApiUrl(), request);
  }

  getFlashcards(filter?: FlashcardFilter, sort?: FlashcardSort): Observable<FlashcardResponseDTO[]> {
    let params = new HttpParams();

    if (filter) {
      if (filter.materiaId) params = params.set('materiaId', filter.materiaId.toString());
      if (filter.dificuldade) params = params.set('dificuldade', filter.dificuldade);
      if (filter.status) params = params.set('status', filter.status);
      if (filter.dataInicio) params = params.set('dataInicio', filter.dataInicio.toISOString());
      if (filter.dataFim) params = params.set('dataFim', filter.dataFim.toISOString());
    }

    if (sort) {
      params = params.set('sortBy', sort.campo);
      params = params.set('sortOrder', sort.ordem);
    }

    return this.http.get<FlashcardResponseDTO[]>(this.getApiUrl(), { params });
  }

  getFlashcardById(id: number): Observable<FlashcardResponseDTO> {
    return this.http.get<FlashcardResponseDTO>(`${this.getApiUrl()}/${id}`);
  }

  atualizarFlashcard(id: number, request: Partial<FlashcardRequestDTO>): Observable<FlashcardResponseDTO> {
    return this.http.put<FlashcardResponseDTO>(`${this.getApiUrl()}/${id}`, request);
  }

  deletarFlashcard(id: number): Observable<void> {
    return this.http.delete<void>(`${this.getApiUrl()}/${id}`);
  }

  // Revisão
  revisarFlashcard(revisao: FlashcardRevisaoDTO): Observable<FlashcardResponseDTO> {
    return this.http.post<FlashcardResponseDTO>(`${this.getApiUrl()}/revisar`, revisao);
  }

  revisarFlashcardsLote(revisoes: RevisarFlashcardsLoteDTO): Observable<FlashcardResponseDTO[]> {
    return this.http.post<FlashcardResponseDTO[]>(`${this.getApiUrl()}/revisar/lote`, revisoes);
  }

  // Decks e Sessões
  getDeckByMateria(materiaId: number): Observable<DeckFlashcards> {
    return this.getFlashcards({ materiaId }).pipe(
      map(flashcards => {
        const cardsParaRevisar = flashcards.filter(card =>
          card.status !== FlashcardStatus.DOMINADO &&
          new Date(card.proximaRevisao) <= new Date()
        ).length;

        const cardsNovos = flashcards.filter(card =>
          card.status === FlashcardStatus.NOVO
        ).length;

        const progresso = flashcards.length > 0 ?
          (flashcards.filter(card => card.status === FlashcardStatus.DOMINADO).length / flashcards.length) * 100 : 0;

        return {
          materiaId,
          materiaNome: flashcards[0]?.materiaNome || 'Matéria',
          flashcards,
          totalCards: flashcards.length,
          cardsParaRevisar,
          cardsNovos,
          progresso: Math.round(progresso)
        };
      })
    );
  }

  iniciarSessaoRevisao(materiaId: number, limiteNovos: number = 10, limiteRevisoes: number = 20): Observable<SessaoRevisao> {
    return combineLatest([
      this.getFlashcards({ materiaId, status: FlashcardStatus.NOVO }).pipe(
        map(cards => cards.slice(0, limiteNovos))
      ),
      this.getFlashcards({ materiaId }).pipe(
        map(cards => cards.filter(card =>
          card.status !== FlashcardStatus.NOVO &&
          card.status !== FlashcardStatus.DOMINADO &&
          new Date(card.proximaRevisao) <= new Date()
        ).slice(0, limiteRevisoes))
      )
    ]).pipe(
      map(([novos, paraRevisar]) => {
        const flashcards = [...novos, ...paraRevisar];
        const sessao: SessaoRevisao = {
          materiaId,
          flashcards,
          cardAtual: 0,
          totalCards: flashcards.length,
          cardsRevisados: 0,
          tempoInicio: new Date(),
          tempoTotal: 0,
          status: 'ATIVA'
        };

        this.sessaoAtualSubject.next(sessao);
        return sessao;
      })
    );
  }

  avancarCard(qualidade: QualidadeResposta, tempoResposta?: number): Observable<SessaoRevisao | null> {
    const sessaoAtual = this.sessaoAtualSubject.value;
    if (!sessaoAtual || sessaoAtual.cardAtual >= sessaoAtual.totalCards) {
      return this.finalizarSessao();
    }

    const cardAtual = sessaoAtual.flashcards[sessaoAtual.cardAtual];

    // Revisar o card atual
    this.revisarFlashcard({
      flashcardId: cardAtual.id!,
      qualidade,
      tempoResposta
    }).subscribe();

    // Avançar para o próximo card
    sessaoAtual.cardAtual++;
    sessaoAtual.cardsRevisados++;

    if (sessaoAtual.cardAtual >= sessaoAtual.totalCards) {
      return this.finalizarSessao();
    }

    this.sessaoAtualSubject.next(sessaoAtual);
    return this.sessaoAtualSubject.asObservable().pipe(map(() => sessaoAtual));
  }

  finalizarSessao(): Observable<SessaoRevisao | null> {
    const sessaoAtual = this.sessaoAtualSubject.value;
    if (sessaoAtual) {
      sessaoAtual.status = 'FINALIZADA';
      sessaoAtual.tempoTotal = Math.floor((new Date().getTime() - sessaoAtual.tempoInicio.getTime()) / 1000);
      this.sessaoAtualSubject.next(sessaoAtual);
    }
    return this.sessaoAtualSubject.asObservable().pipe(map(() => null));
  }

  // Estatísticas
  getEstatisticas(): Observable<EstatisticasFlashcard> {
    return this.getFlashcards().pipe(
      map(flashcards => {
        const totalFlashcards = flashcards.length;
        const flashcardsRevisados = flashcards.filter(card => card.dataRevisao).length;
        const taxaAcerto = flashcardsRevisados > 0 ?
          (flashcards.filter(card => card.repeticoes > 0).length / flashcardsRevisados) * 100 : 0;

        // Calcular streak (simplificado)
        const streakAtual = 5;
        const melhorStreak = 12;

        // Tempo médio de resposta (simplificado)
        const tempoMedioResposta = 15;

        // Distribuição de dificuldade
        const facil = flashcards.filter(card => card.dificuldade === Dificuldade.FACIL).length;
        const medio = flashcards.filter(card => card.dificuldade === Dificuldade.MEDIO).length;
        const dificil = flashcards.filter(card => card.dificuldade === Dificuldade.DIFICIL).length;

        // Progresso por matéria (simplificado)
        const progressoMaterias = [
          { materiaId: 1, materiaNome: 'Matemática', progresso: 75 },
          { materiaId: 2, materiaNome: 'Português', progresso: 60 }
        ];

        const stats: EstatisticasFlashcard = {
          totalFlashcards,
          flashcardsRevisados,
          taxaAcerto: Math.round(taxaAcerto),
          streakAtual,
          melhorStreak,
          tempoMedioResposta,
          distribuicaoDificuldade: { facil, medio, dificil },
          progressoMaterias
        };

        this.statsSubject.next(stats);
        return stats;
      })
    );
  }

  // Operações em lote
  criarFlashcardsLote(request: CriarFlashcardsLoteDTO): Observable<FlashcardResponseDTO[]> {
    return this.http.post<FlashcardResponseDTO[]>(`${this.getApiUrl()}/lote`, request);
  }

  deletarFlashcardsLote(ids: number[]): Observable<void> {
    const params = new HttpParams().set('ids', ids.join(','));
    return this.http.delete<void>(`${this.getApiUrl()}/lote`, { params });
  }

  // Utilitários
  getConfig(): FlashcardConfig {
    return { ...this.config };
  }

  atualizarConfig(config: Partial<FlashcardConfig>): void {
    this.config = { ...this.config, ...config };
  }

  calcularProximaRevisao(card: FlashcardResponseDTO, qualidade: QualidadeResposta): Date {
    // Algoritmo SM-2 simplificado
    let facilidade = card.facilidade;
    let intervalo = card.intervaloRevisao;

    if (qualidade >= 3) {
      // Resposta correta
      if (card.repeticoes === 0) {
        intervalo = 1;
      } else if (card.repeticoes === 1) {
        intervalo = 6;
      } else {
        intervalo = Math.round(card.intervaloRevisao * facilidade);
      }
      facilidade = Math.max(1.3, facilidade + (0.1 - (5 - qualidade) * (0.08 + (5 - qualidade) * 0.02)));
    } else {
      // Resposta incorreta
      intervalo = 1;
      facilidade = Math.max(1.3, facilidade - 0.2);
    }

    const proximaRevisao = new Date();
    proximaRevisao.setDate(proximaRevisao.getDate() + intervalo);

    return proximaRevisao;
  }

  // Gamificação
  getGamificationStats(): Observable<GamificationFlashcard> {
    return this.getFlashcards().pipe(
      map(flashcards => {
        const cardsCriados = flashcards.length;
        const cardsRevisados = flashcards.filter(card => card.dataRevisao).length;

        // Calcular XP baseado em cards criados e revisados
        const xpAtual = (cardsCriados * 5) + (cardsRevisados * 2);
        const nivelAtual = Math.floor(xpAtual / 100) + 1;
        const xpParaProximoNivel = (nivelAtual * 100) - xpAtual;

        // Achievements
        const achievements = [
          {
            id: 'first_card',
            titulo: 'Primeiro Card',
            descricao: 'Crie seu primeiro flashcard',
            icone: '📝',
            criterio: { tipo: 'cards_criados', valor: 1 },
            xpReward: 10,
            unlocked: cardsCriados > 0,
            unlockedAt: cardsCriados > 0 ? new Date() : undefined
          }
        ];

        return {
          nivelAtual,
          xpAtual,
          xpParaProximoNivel,
          achievements,
          streakRevisao: 5,
          melhorStreak: 12,
          cardsCriados,
          cardsRevisados
        };
      })
    );
  }
}