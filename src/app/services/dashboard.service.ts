import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, combineLatest, map, timer } from 'rxjs';
import { EnvService } from './env.service';

// Importando os modelos específicos
import {
  DashboardData,
  ResumoGeral,
  AtividadeRecente,
  ProgressoSemanal,
  MetaAtual,
  EstatisticaRapida,
  ProximaAtividade,
  Notificacao,
  TipoAtividadeDashboard,
  TipoMetaDashboard,
  StatusMetaDashboard,
  TipoNotificacao,
  WidgetConfig,
  TipoWidget,
  GraficoProgresso,
  CalendarioSemanal,
  DashboardFilters,
  DashboardConfig,
  AtualizarDashboardDTO,
  MarcarNotificacaoLidaDTO,
  DadosAgregados,
  Recomendacao,
  TipoRecomendacao
} from '../models/dashboard.models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private dashboardDataSubject = new BehaviorSubject<DashboardData | null>(null);
  private notificacoesSubject = new BehaviorSubject<Notificacao[]>([]);
  private configSubject = new BehaviorSubject<DashboardConfig | null>(null);

  public dashboardData$ = this.dashboardDataSubject.asObservable();
  public notificacoes$ = this.notificacoesSubject.asObservable();
  public config$ = this.configSubject.asObservable();

  private configPadrao: DashboardConfig = {
    widgetsVisiveis: ['RESUMO_GERAL', 'PROGRESSO_SEMANAL', 'ATIVIDADES_RECENTES', 'METAS_ATUAIS'],
    layout: [],
    tema: 'light',
    atualizacaoAutomatica: true,
    intervaloAtualizacao: 5, // minutos
    notificacoesAtivadas: true
  };

  constructor(
    private http: HttpClient,
    private env: EnvService
  ) { }

  private getApiUrl(): string {
    return `${this.env.apiEstudosBase()}/api/v1/dashboard`;
  }

  // Dashboard principal
  getDashboardData(filters?: DashboardFilters): Observable<DashboardData> {
    let params = new HttpParams();

    if (filters) {
      if (filters.periodo) params = params.set('periodo', filters.periodo);
      if (filters.materiaId) params = params.set('materiaId', filters.materiaId.toString());
      if (filters.tipoAtividade) params = params.set('tipoAtividade', filters.tipoAtividade);
      if (filters.dataInicio) params = params.set('dataInicio', filters.dataInicio.toISOString());
      if (filters.dataFim) params = params.set('dataFim', filters.dataFim.toISOString());
    }

    return this.http.get<DashboardData>(this.getApiUrl(), { params }).pipe(
      map(data => {
        this.dashboardDataSubject.next(data);
        return data;
      })
    );
  }

  // Componentes individuais
  getResumoGeral(): Observable<ResumoGeral> {
    return this.http.get<ResumoGeral>(`${this.getApiUrl()}/resumo`);
  }

  getAtividadesRecentes(limite: number = 10): Observable<AtividadeRecente[]> {
    return this.http.get<AtividadeRecente[]>(`${this.getApiUrl()}/atividades-recentes`, {
      params: { limite: limite.toString() }
    });
  }

  getProgressoSemanal(): Observable<ProgressoSemanal> {
    return this.http.get<ProgressoSemanal>(`${this.getApiUrl()}/progresso-semanal`);
  }

  getMetasAtuais(): Observable<MetaAtual[]> {
    return this.http.get<MetaAtual[]>(`${this.getApiUrl()}/metas-atuais`);
  }

  getProximasAtividades(limite: number = 5): Observable<ProximaAtividade[]> {
    return this.http.get<ProximaAtividade[]>(`${this.getApiUrl()}/proximas-atividades`, {
      params: { limite: limite.toString() }
    });
  }

  // Notificações
  getNotificacoes(): Observable<Notificacao[]> {
    return this.http.get<Notificacao[]>(`${this.getApiUrl()}/notificacoes`).pipe(
      map(notificacoes => {
        this.notificacoesSubject.next(notificacoes);
        return notificacoes;
      })
    );
  }

  marcarNotificacaoLida(request: MarcarNotificacaoLidaDTO): Observable<void> {
    return this.http.patch<void>(`${this.getApiUrl()}/notificacoes/${request.notificacaoId}/lida`, {});
  }

  marcarTodasNotificacoesLidas(): Observable<void> {
    return this.http.patch<void>(`${this.getApiUrl()}/notificacoes/marcar-todas-lidas`, {});
  }

  // Configuração
  getConfiguracao(): Observable<DashboardConfig> {
    return this.http.get<DashboardConfig>(`${this.getApiUrl()}/configuracao`).pipe(
      map(config => {
        this.configSubject.next(config);
        return config;
      })
    );
  }

  atualizarConfiguracao(request: AtualizarDashboardDTO): Observable<DashboardConfig> {
    return this.http.put<DashboardConfig>(`${this.getApiUrl()}/configuracao`, request).pipe(
      map(config => {
        this.configSubject.next(config);
        return config;
      })
    );
  }

  // Gráficos e visualizações
  getGraficoProgresso(tipo: 'xp' | 'minutos' | 'flashcards' | 'eventos', periodo: string = '7d'): Observable<GraficoProgresso> {
    return this.http.get<GraficoProgresso>(`${this.getApiUrl()}/graficos/progresso`, {
      params: { tipo, periodo }
    });
  }

  getCalendarioSemanal(): Observable<CalendarioSemanal> {
    return this.http.get<CalendarioSemanal>(`${this.getApiUrl()}/calendario-semanal`);
  }

  // Dados agregados
  getDadosAgregados(periodo: string = 'mes'): Observable<DadosAgregados> {
    return this.http.get<DadosAgregados>(`${this.getApiUrl()}/dados-agregados`, {
      params: { periodo }
    });
  }

  // Recomendações
  getRecomendacoes(): Observable<Recomendacao[]> {
    return this.http.get<Recomendacao[]>(`${this.getApiUrl()}/recomendacoes`);
  }

  // Utilitários
  iniciarAtualizacaoAutomatica(): void {
    if (this.configPadrao.atualizacaoAutomatica) {
      timer(0, this.configPadrao.intervaloAtualizacao * 60 * 1000).subscribe(() => {
        this.atualizarDashboard();
      });
    }
  }

  pararAtualizacaoAutomatica(): void {
    // Implementar lógica para parar o timer se necessário
  }

  private atualizarDashboard(): void {
    this.getDashboardData().subscribe();
    this.getNotificacoes().subscribe();
  }

  // Cálculos e formatação
  formatarTempo(minutos: number): string {
    if (minutos < 60) {
      return `${minutos}min`;
    }
    const horas = Math.floor(minutos / 60);
    const minRestantes = minutos % 60;
    return minRestantes > 0 ? `${horas}h ${minRestantes}min` : `${horas}h`;
  }

  calcularPorcentagem(atual: number, total: number): number {
    return total > 0 ? Math.round((atual / total) * 100) : 0;
  }

  getCorPorPrioridade(prioridade: string): string {
    switch (prioridade) {
      case 'urgente': return '#dc3545';
      case 'alta': return '#fd7e14';
      case 'media': return '#ffc107';
      case 'baixa': return '#28a745';
      default: return '#6c757d';
    }
  }

  getIconePorTipoAtividade(tipo: TipoAtividadeDashboard): string {
    switch (tipo) {
      case TipoAtividadeDashboard.SESSAO_ESTUDO: return '⏱️';
      case TipoAtividadeDashboard.FLASHCARD_CRIADO: return '🃏';
      case TipoAtividadeDashboard.FLASHCARD_REVISADO: return '🔄';
      case TipoAtividadeDashboard.EVENTO_CRIADO: return '📅';
      case TipoAtividadeDashboard.EVENTO_CONCLUIDO: return '✅';
      case TipoAtividadeDashboard.CONQUISTA_DESBLOQUEADA: return '🏆';
      case TipoAtividadeDashboard.NIVEL_ALCANCADO: return '⬆️';
      case TipoAtividadeDashboard.META_CONCLUIDA: return '🎯';
      default: return '📝';
    }
  }

  getCorPorTipoAtividade(tipo: TipoAtividadeDashboard): string {
    switch (tipo) {
      case TipoAtividadeDashboard.SESSAO_ESTUDO: return '#007bff';
      case TipoAtividadeDashboard.FLASHCARD_CRIADO: return '#28a745';
      case TipoAtividadeDashboard.FLASHCARD_REVISADO: return '#17a2b8';
      case TipoAtividadeDashboard.EVENTO_CRIADO: return '#ffc107';
      case TipoAtividadeDashboard.EVENTO_CONCLUIDO: return '#28a745';
      case TipoAtividadeDashboard.CONQUISTA_DESBLOQUEADA: return '#fd7e14';
      case TipoAtividadeDashboard.NIVEL_ALCANCADO: return '#6f42c1';
      case TipoAtividadeDashboard.META_CONCLUIDA: return '#e83e8c';
      default: return '#6c757d';
    }
  }
}