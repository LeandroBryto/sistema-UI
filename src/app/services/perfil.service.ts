import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map, combineLatest } from 'rxjs';
import { EnvService } from './env.service';

// Importando os modelos específicos
import {
  PerfilUsuarioEntity,
  PerfilRequestDTO,
  PerfilResponseDTO,
  EstatisticasPerfil,
  Achievement,
  ConquistaResponseDTO,
  ProgressoDiario,
  HistoricoAtividade,
  Atividade,
  ConfiguracaoPerfil,
  SistemaGamificacao,
  RankingUsuario,
  Leaderboard,
  Meta,
  MetaRequestDTO,
  TipoMeta,
  StatusMeta,
  RelatorioProgresso,
  AtualizarPerfilDTO,
  AtualizarConfiguracaoDTO,
  PerfilCompletoResponse
} from '../models/perfil.models';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {

  private perfilSubject = new BehaviorSubject<PerfilResponseDTO | null>(null);
  private configSubject = new BehaviorSubject<ConfiguracaoPerfil | null>(null);
  private achievementsSubject = new BehaviorSubject<Achievement[]>([]);

  public perfil$ = this.perfilSubject.asObservable();
  public config$ = this.configSubject.asObservable();
  public achievements$ = this.achievementsSubject.asObservable();

  private configPadrao: ConfiguracaoPerfil = {
    notificacoesAtivadas: true,
    notificacoesEmail: true,
    tema: 'light',
    idioma: 'pt-BR',
    privacidade: {
      mostrarProgresso: true,
      mostrarConquistas: true,
      mostrarEstatisticas: true
    },
    lembretes: {
      estudo: true,
      revisao: true,
      eventos: true
    },
    objetivos: {
      diario: {
        minutosEstudo: 25,
        flashcardsRevisao: 10,
        eventosConclusao: 2
      },
      semanal: {
        minutosEstudo: 150,
        flashcardsRevisao: 50,
        eventosConclusao: 10
      }
    }
  };

  constructor(
    private http: HttpClient,
    private env: EnvService
  ) { }

  private getApiUrl(): string {
    return `${this.env.apiEstudosBase()}/api/v1/perfil`;
  }

  // Perfil CRUD
  getPerfil(): Observable<PerfilResponseDTO> {
    return this.http.get<PerfilResponseDTO>(this.getApiUrl()).pipe(
      map(perfil => {
        this.perfilSubject.next(perfil);
        return perfil;
      })
    );
  }

  getMeuPerfil(): Observable<PerfilCompletoResponse> {
    return this.http.get<PerfilCompletoResponse>(`${this.getApiUrl()}/meus-dados`);
  }

  atualizarPerfil(request: AtualizarPerfilDTO): Observable<PerfilResponseDTO> {
    return this.http.put<PerfilResponseDTO>(this.getApiUrl(), request).pipe(
      map(perfil => {
        this.perfilSubject.next(perfil);
        return perfil;
      })
    );
  }

  // Estatísticas
  getEstatisticas(): Observable<EstatisticasPerfil> {
    return this.http.get<EstatisticasPerfil>(`${this.getApiUrl()}/estatisticas`);
  }

  // Gamificação
  getSistemaGamificacao(): Observable<SistemaGamificacao> {
    return this.http.get<SistemaGamificacao>(`${this.getApiUrl()}/gamificacao`);
  }

  // Achievements
  getAchievements(): Observable<Achievement[]> {
    return this.http.get<Achievement[]>(`${this.getApiUrl()}/achievements`).pipe(
      map(achievements => {
        this.achievementsSubject.next(achievements);
        return achievements;
      })
    );
  }

  getConquistas(): Observable<ConquistaResponseDTO[]> {
    return this.http.get<ConquistaResponseDTO[]>(`${this.getApiUrl()}/conquistas`);
  }

  // Atividades e histórico
  getHistoricoAtividade(dataInicio?: Date, dataFim?: Date): Observable<HistoricoAtividade[]> {
    let params = '';
    if (dataInicio && dataFim) {
      params = `?dataInicio=${dataInicio.toISOString()}&dataFim=${dataFim.toISOString()}`;
    }
    return this.http.get<HistoricoAtividade[]>(`${this.getApiUrl()}/historico${params}`);
  }

  getProgressoDiario(dataInicio: Date, dataFim: Date): Observable<ProgressoDiario[]> {
    return this.http.get<ProgressoDiario[]>(`${this.getApiUrl()}/progresso-diario`, {
      params: {
        dataInicio: dataInicio.toISOString(),
        dataFim: dataFim.toISOString()
      }
    });
  }

  // Configurações
  getConfiguracao(): Observable<ConfiguracaoPerfil> {
    return this.http.get<ConfiguracaoPerfil>(`${this.getApiUrl()}/configuracao`).pipe(
      map(config => {
        this.configSubject.next(config);
        return config;
      })
    );
  }

  atualizarConfiguracao(request: AtualizarConfiguracaoDTO): Observable<ConfiguracaoPerfil> {
    return this.http.put<ConfiguracaoPerfil>(`${this.getApiUrl()}/configuracao`, request).pipe(
      map(config => {
        this.configSubject.next(config);
        return config;
      })
    );
  }

  // Metas
  getMetas(): Observable<Meta[]> {
    return this.http.get<Meta[]>(`${this.getApiUrl()}/metas`);
  }

  criarMeta(request: MetaRequestDTO): Observable<Meta> {
    return this.http.post<Meta>(`${this.getApiUrl()}/metas`, request);
  }

  atualizarMeta(id: string, progresso: number): Observable<Meta> {
    return this.http.patch<Meta>(`${this.getApiUrl()}/metas/${id}`, { progresso });
  }

  deletarMeta(id: string): Observable<void> {
    return this.http.delete<void>(`${this.getApiUrl()}/metas/${id}`);
  }

  // Leaderboard
  getLeaderboard(): Observable<Leaderboard> {
    return this.http.get<Leaderboard>(`${this.getApiUrl()}/leaderboard`);
  }

  // Relatórios
  getRelatorioProgresso(periodo: 'semana' | 'mes' | 'ano' = 'mes'): Observable<RelatorioProgresso> {
    return this.http.get<RelatorioProgresso>(`${this.getApiUrl()}/relatorios/progresso`, {
      params: { periodo }
    });
  }

  // Utilitários
  calcularXpParaProximoNivel(nivelAtual: number): number {
    // Fórmula: XP necessário = nível * 100
    return nivelAtual * 100;
  }

  calcularNivelPorXp(xpTotal: number): number {
    // Fórmula: nível = floor(XP / 100) + 1
    return Math.floor(xpTotal / 100) + 1;
  }

  getXpParaProximoNivel(xpTotal: number): number {
    const nivelAtual = this.calcularNivelPorXp(xpTotal);
    const xpProximoNivel = this.calcularXpParaProximoNivel(nivelAtual);
    return xpProximoNivel - xpTotal;
  }

  // Verificar se achievement foi desbloqueado
  verificarAchievement(achievement: Achievement, estatisticas: EstatisticasPerfil): boolean {
    const { criterio } = achievement;

    switch (criterio.tipo) {
      case 'MINUTOS_ESTUDO':
        return estatisticas.horasTotaisEstudo * 60 >= criterio.valor;
      case 'SESSOES_ESTUDO':
        return estatisticas.diasEstudados >= criterio.valor;
      case 'FLASHCARDS_CRIADOS':
        return estatisticas.flashcardsCriados >= criterio.valor;
      case 'FLASHCARDS_REVISADOS':
        return estatisticas.flashcardsRevisados >= criterio.valor;
      case 'STREAK_DIAS':
        return estatisticas.streakAtual >= criterio.valor;
      case 'EVENTOS_CONCLUIDOS':
        return estatisticas.eventosConcluidos >= criterio.valor;
      case 'MATERIAS_ATIVAS':
        return estatisticas.materiasAtivas >= criterio.valor;
      case 'NIVEL_ALCANCADO':
        return estatisticas.nivelAtual >= criterio.valor;
      case 'XP_TOTAL':
        return estatisticas.xpTotalGanho >= criterio.valor;
      default:
        return false;
    }
  }

  // Calcular progresso do achievement
  calcularProgressoAchievement(achievement: Achievement, estatisticas: EstatisticasPerfil): number {
    const { criterio } = achievement;

    let valorAtual = 0;
    switch (criterio.tipo) {
      case 'MINUTOS_ESTUDO':
        valorAtual = estatisticas.horasTotaisEstudo * 60;
        break;
      case 'SESSOES_ESTUDO':
        valorAtual = estatisticas.diasEstudados;
        break;
      case 'FLASHCARDS_CRIADOS':
        valorAtual = estatisticas.flashcardsCriados;
        break;
      case 'FLASHCARDS_REVISADOS':
        valorAtual = estatisticas.flashcardsRevisados;
        break;
      case 'STREAK_DIAS':
        valorAtual = estatisticas.streakAtual;
        break;
      case 'EVENTOS_CONCLUIDOS':
        valorAtual = estatisticas.eventosConcluidos;
        break;
      case 'MATERIAS_ATIVAS':
        valorAtual = estatisticas.materiasAtivas;
        break;
      case 'NIVEL_ALCANCADO':
        valorAtual = estatisticas.nivelAtual;
        break;
      case 'XP_TOTAL':
        valorAtual = estatisticas.xpTotalGanho;
        break;
    }

    return Math.min((valorAtual / criterio.valor) * 100, 100);
  }

  // Verificar objetivos diários/semanais
  verificarObjetivos(estatisticas: EstatisticasPerfil, config: ConfiguracaoPerfil): {
    diario: { [key: string]: boolean };
    semanal: { [key: string]: boolean };
  } {
    const hoje = new Date();
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());

    // Para simplificar, assumimos que as estatísticas são do dia/semana atual
    // Em produção, seria necessário filtrar por período

    return {
      diario: {
        minutosEstudo: (estatisticas.horasTotaisEstudo * 60) >= config.objetivos.diario.minutosEstudo,
        flashcardsRevisao: estatisticas.flashcardsRevisados >= config.objetivos.diario.flashcardsRevisao,
        eventosConclusao: estatisticas.eventosConcluidos >= config.objetivos.diario.eventosConclusao
      },
      semanal: {
        minutosEstudo: (estatisticas.horasTotaisEstudo * 60) >= config.objetivos.semanal.minutosEstudo,
        flashcardsRevisao: estatisticas.flashcardsRevisados >= config.objetivos.semanal.flashcardsRevisao,
        eventosConclusao: estatisticas.eventosConcluidos >= config.objetivos.semanal.eventosConclusao
      }
    };
  }
}