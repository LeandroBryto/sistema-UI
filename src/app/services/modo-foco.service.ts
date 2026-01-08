import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, map, takeWhile } from 'rxjs';
import { EnvService } from './env.service';

// Importando os modelos específicos
import {
  SessaoEstudoEntity,
  SessaoRequestDTO,
  SessaoResponseDTO,
  TimerConfig,
  SessaoAtiva,
  SessaoStats,
  TimerState,
  TimerEvent
} from '../models/modo-foco.models';

@Injectable({
  providedIn: 'root'
})
export class ModoFocoService {

  private timerConfig: TimerConfig = {
    duracaoPadrao: 25, // 25 minutos
    intervaloDescanso: 5, // 5 minutos
    sessoesPorCiclo: 4
  };

  private sessaoAtivaSubject = new BehaviorSubject<SessaoAtiva | null>(null);
  private timerStateSubject = new BehaviorSubject<TimerState>('idle');
  private timerEventsSubject = new BehaviorSubject<TimerEvent | null>(null);

  public sessaoAtiva$ = this.sessaoAtivaSubject.asObservable();
  public timerState$ = this.timerStateSubject.asObservable();
  public timerEvents$ = this.timerEventsSubject.asObservable();

  private timerSubscription: any;

  constructor(
    private http: HttpClient,
    private env: EnvService
  ) { }

  private getApiUrl(): string {
    return `${this.env.apiEstudosBase()}/api/v1/sessoes`;
  }

  // Sessões CRUD
  iniciarSessao(request: SessaoRequestDTO): Observable<SessaoResponseDTO> {
    return this.http.post<SessaoResponseDTO>(`${this.getApiUrl()}/iniciar`, request);
  }

  finalizarSessao(sessaoId: number, minutosTotais: number, anotacoes: string): Observable<SessaoResponseDTO> {
    return this.http.patch<SessaoResponseDTO>(`${this.getApiUrl()}/${sessaoId}/finalizar`, {
      minutosTotais,
      anotacoes
    });
  }

  getSessoes(): Observable<SessaoResponseDTO[]> {
    return this.http.get<SessaoResponseDTO[]>(this.getApiUrl());
  }

  getSessaoById(id: number): Observable<SessaoResponseDTO> {
    return this.http.get<SessaoResponseDTO>(`${this.getApiUrl()}/${id}`);
  }

  // Timer Management
  iniciarTimer(materiaId: number, materiaNome: string): void {
    const sessao: SessaoAtiva = {
      materiaId,
      materiaNome,
      tempoRestante: this.timerConfig.duracaoPadrao * 60, // converter para segundos
      isRunning: true,
      isPaused: false,
      anotacoes: '',
      dataInicio: new Date()
    };

    this.sessaoAtivaSubject.next(sessao);
    this.timerStateSubject.next('running');
    this.emitTimerEvent('start', sessao);

    this.startTimerCountdown();
  }

  pausarTimer(): void {
    const sessaoAtual = this.sessaoAtivaSubject.value;
    if (sessaoAtual) {
      sessaoAtual.isRunning = false;
      sessaoAtual.isPaused = true;
      this.sessaoAtivaSubject.next(sessaoAtual);
      this.timerStateSubject.next('paused');
      this.emitTimerEvent('pause');

      if (this.timerSubscription) {
        this.timerSubscription.unsubscribe();
      }
    }
  }

  retomarTimer(): void {
    const sessaoAtual = this.sessaoAtivaSubject.value;
    if (sessaoAtual && sessaoAtual.isPaused) {
      sessaoAtual.isRunning = true;
      sessaoAtual.isPaused = false;
      this.sessaoAtivaSubject.next(sessaoAtual);
      this.timerStateSubject.next('running');
      this.emitTimerEvent('resume');

      this.startTimerCountdown();
    }
  }

  finalizarTimer(): Observable<SessaoResponseDTO> {
    const sessaoAtual = this.sessaoAtivaSubject.value;
    if (!sessaoAtual) {
      throw new Error('Nenhuma sessão ativa');
    }

    const minutosTotais = Math.floor((this.timerConfig.duracaoPadrao * 60 - sessaoAtual.tempoRestante) / 60);

    return this.finalizarSessao(sessaoAtual.id!, minutosTotais, sessaoAtual.anotacoes).pipe(
      map(response => {
        this.limparSessao();
        this.emitTimerEvent('finish', response);
        return response;
      })
    );
  }

  cancelarTimer(): void {
    this.limparSessao();
    this.emitTimerEvent('finish');
  }

  atualizarAnotacoes(anotacoes: string): void {
    const sessaoAtual = this.sessaoAtivaSubject.value;
    if (sessaoAtual) {
      sessaoAtual.anotacoes = anotacoes;
      this.sessaoAtivaSubject.next(sessaoAtual);
    }
  }

  private startTimerCountdown(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }

    this.timerSubscription = interval(1000).pipe(
      takeWhile(() => {
        const sessao = this.sessaoAtivaSubject.value;
        return sessao ? sessao.isRunning && sessao.tempoRestante > 0 : false;
      })
    ).subscribe(() => {
      const sessaoAtual = this.sessaoAtivaSubject.value;
      if (sessaoAtual && sessaoAtual.isRunning) {
        sessaoAtual.tempoRestante--;

        if (sessaoAtual.tempoRestante <= 0) {
          this.timerStateSubject.next('finished');
          this.emitTimerEvent('finish');
        } else {
          this.emitTimerEvent('tick', { tempoRestante: sessaoAtual.tempoRestante });
        }

        this.sessaoAtivaSubject.next(sessaoAtual);
      }
    });
  }

  private limparSessao(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    this.sessaoAtivaSubject.next(null);
    this.timerStateSubject.next('idle');
  }

  private emitTimerEvent(type: TimerEvent['type'], data?: any): void {
    this.timerEventsSubject.next({ type, data });
  }

  // Utilitários
  getTimerConfig(): TimerConfig {
    return { ...this.timerConfig };
  }

  atualizarTimerConfig(config: Partial<TimerConfig>): void {
    this.timerConfig = { ...this.timerConfig, ...config };
  }

  formatarTempo(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`;
  }

  calcularXpGanho(minutos: number): number {
    // 10 XP por minuto de estudo focado
    return minutos * 10;
  }

  // Estatísticas
  getSessaoStats(): Observable<SessaoStats> {
    return this.getSessoes().pipe(
      map(sessoes => {
        const totalSessoes = sessoes.length;
        const minutosTotais = sessoes.reduce((acc, sessao) => acc + sessao.minutosTotais, 0);
        const xpTotalGanho = sessoes.reduce((acc, sessao) => acc + (sessao.xpGanho || 0), 0);

        // Calcular dias estudados (dias únicos)
        const diasUnicos = new Set(
          sessoes.map(sessao => sessao.dataInicio.toDateString())
        ).size;

        // Calcular sequência atual (simplificado - seria mais complexo no backend)
        const sequenciaAtual = 5;

        return {
          totalSessoes,
          minutosTotais,
          xpTotalGanho,
          diasEstudados: diasUnicos,
          sequenciaAtual
        };
      })
    );
  }
}