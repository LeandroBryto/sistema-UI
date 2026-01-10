import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, map, combineLatest } from 'rxjs';
import { EnvService } from './env.service';

// Importando os modelos específicos
import {
  EventoEntity,
  EventoRequestDTO,
  EventoResponseDTO,
  AgendaDia,
  AgendaSemana,
  AgendaMes,
  EstatisticasAgenda,
  TipoEvento,
  Prioridade,
  StatusEvento,
  Recorrencia,
  EventoFilter,
  EventoSort,
  CalendarioConfig,
  AtualizarEventoDTO,
  MoverEventoDTO,
  CriarEventoLoteDTO,
  Lembrete,
  NotificacaoEvento,
  RelatorioPeriodo,
  RelatorioComparativo,
  EventoEstudo,
  CronogramaEstudo
} from '../models/agenda.models';

// Importando modelos de estudos para agenda simples
import {
  ItemAgendaEntity,
  CriarItemAgendaRequest,
  DiaSemana,
  AgendaResponseDTO
} from '../models/agenda.models';

@Injectable({
  providedIn: 'root'
})
export class AgendaService {

  private config: CalendarioConfig = {
    vistaPadrao: 'mes',
    horaInicio: 8,
    horaFim: 22,
    mostrarFinsDeSemana: true,
    tema: 'light',
    notificacoesAtivadas: true,
    lembretePadrao: 15
  };

  private eventosSubject = new BehaviorSubject<EventoResponseDTO[]>([]);
  private lembretesSubject = new BehaviorSubject<Lembrete[]>([]);

  public eventos$ = this.eventosSubject.asObservable();
  public lembretes$ = this.lembretesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private env: EnvService
  ) { }

  private getApiUrl(): string {
    return `${this.env.apiEstudosBase()}/api/v1/eventos`;
  }

  private getAgendaApiUrl(): string {
    return `${this.env.apiEstudosBase()}/api/v1/agenda`;
  }

  // CRUD Eventos
  criarEvento(request: EventoRequestDTO): Observable<EventoResponseDTO> {
    return this.http.post<EventoResponseDTO>(this.getApiUrl(), request);
  }

  getEventos(filter?: EventoFilter, sort?: EventoSort): Observable<EventoResponseDTO[]> {
    let params = new HttpParams();

    if (filter) {
      if (filter.dataInicio) params = params.set('dataInicio', filter.dataInicio.toISOString());
      if (filter.dataFim) params = params.set('dataFim', filter.dataFim.toISOString());
      if (filter.tipo) params = params.set('tipo', filter.tipo);
      if (filter.prioridade) params = params.set('prioridade', filter.prioridade);
      if (filter.status) params = params.set('status', filter.status);
      if (filter.materiaId) params = params.set('materiaId', filter.materiaId.toString());
    }

    if (sort) {
      params = params.set('sortBy', sort.campo);
      params = params.set('sortOrder', sort.ordem);
    }

    return this.http.get<EventoResponseDTO[]>(this.getApiUrl(), { params }).pipe(
      map(eventos => {
        this.eventosSubject.next(eventos);
        return eventos;
      })
    );
  }

  getEventoById(id: number): Observable<EventoResponseDTO> {
    return this.http.get<EventoResponseDTO>(`${this.getApiUrl()}/${id}`);
  }

  atualizarEvento(id: number, request: AtualizarEventoDTO): Observable<EventoResponseDTO> {
    return this.http.put<EventoResponseDTO>(`${this.getApiUrl()}/${id}`, request).pipe(
      map(evento => {
        this.atualizarEventoNaLista(evento);
        return evento;
      })
    );
  }

  deletarEvento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.getApiUrl()}/${id}`).pipe(
      map(() => {
        this.removerEventoDaLista(id);
      })
    );
  }

  // Operações especiais
  moverEvento(id: number, movimento: MoverEventoDTO): Observable<EventoResponseDTO> {
    return this.http.patch<EventoResponseDTO>(`${this.getApiUrl()}/${id}/mover`, movimento).pipe(
      map(evento => {
        this.atualizarEventoNaLista(evento);
        return evento;
      })
    );
  }

  concluirEvento(id: number): Observable<EventoResponseDTO> {
    return this.atualizarEvento(id, { status: StatusEvento.CONCLUIDO });
  }

  cancelarEvento(id: number): Observable<EventoResponseDTO> {
    return this.atualizarEvento(id, { status: StatusEvento.CANCELADO });
  }

  // Operações em lote
  criarEventosLote(request: CriarEventoLoteDTO): Observable<EventoResponseDTO[]> {
    return this.http.post<EventoResponseDTO[]>(`${this.getApiUrl()}/lote`, request);
  }

  // Visualizações de agenda
  getAgendaDia(data: Date): Observable<AgendaDia> {
    const inicio = new Date(data);
    inicio.setHours(0, 0, 0, 0);

    const fim = new Date(data);
    fim.setHours(23, 59, 59, 999);

    return this.getEventos({ dataInicio: inicio, dataFim: fim }).pipe(
      map(eventos => {
        const eventosEstudo = eventos.filter(e => e.tipo === TipoEvento.ESTUDO).length;
        const eventosProva = eventos.filter(e => e.tipo === TipoEvento.PROVA).length;
        const eventosTarefa = eventos.filter(e => e.tipo === TipoEvento.TAREFA).length;

        return {
          data,
          eventos,
          totalEventos: eventos.length,
          eventosEstudo,
          eventosProva,
          eventosTarefa
        };
      })
    );
  }

  getAgendaSemana(data: Date): Observable<AgendaSemana> {
    const semanaInicio = new Date(data);
    semanaInicio.setDate(data.getDate() - data.getDay());

    const semanaFim = new Date(semanaInicio);
    semanaFim.setDate(semanaInicio.getDate() + 6);

    const dias: AgendaDia[] = [];
    let totalEventos = 0;
    let cargaEstudo = 0;

    // Criar observable para cada dia da semana
    const diasObservables = [];
    for (let i = 0; i < 7; i++) {
      const dia = new Date(semanaInicio);
      dia.setDate(semanaInicio.getDate() + i);
      diasObservables.push(this.getAgendaDia(dia));
    }

    return combineLatest(diasObservables).pipe(
      map(diasAgenda => {
        diasAgenda.forEach(dia => {
          dias.push(dia);
          totalEventos += dia.totalEventos;
          // Calcular carga de estudo (simplificado)
          cargaEstudo += dia.eventosEstudo * 2; // 2 horas por evento de estudo
        });

        return {
          semanaInicio,
          semanaFim,
          dias,
          totalEventos,
          cargaEstudo
        };
      })
    );
  }

  getAgendaMes(ano: number, mes: number): Observable<AgendaMes> {
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);

    const inicio = new Date(primeiroDia);
    inicio.setHours(0, 0, 0, 0);

    const fim = new Date(ultimoDia);
    fim.setHours(23, 59, 59, 999);

    return this.getEventos({ dataInicio: inicio, dataFim: fim }).pipe(
      map(eventos => {
        const dias: AgendaDia[] = [];
        const eventosPorDia: { [data: string]: number } = {};

        // Agrupar eventos por dia
        const eventosPorData = eventos.reduce((acc, evento) => {
          const dataKey = evento.dataInicio.toDateString();
          if (!acc[dataKey]) {
            acc[dataKey] = [];
          }
          acc[dataKey].push(evento);
          return acc;
        }, {} as { [key: string]: EventoResponseDTO[] });

        // Criar AgendaDia para cada dia do mês
        for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
          const data = new Date(ano, mes, dia);
          const dataKey = data.toDateString();
          const eventosDia = eventosPorData[dataKey] || [];

          const eventosEstudo = eventosDia.filter(e => e.tipo === TipoEvento.ESTUDO).length;
          const eventosProva = eventosDia.filter(e => e.tipo === TipoEvento.PROVA).length;
          const eventosTarefa = eventosDia.filter(e => e.tipo === TipoEvento.TAREFA).length;

          dias.push({
            data,
            eventos: eventosDia,
            totalEventos: eventosDia.length,
            eventosEstudo,
            eventosProva,
            eventosTarefa
          });

          eventosPorDia[dataKey] = eventosDia.length;
        }

        return {
          mes,
          ano,
          dias,
          eventosPorDia,
          totalEventos: eventos.length
        };
      })
    );
  }

  // Estatísticas
  getEstatisticas(): Observable<EstatisticasAgenda> {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());

    return combineLatest([
      this.getEventos(),
      this.getEventos({ dataInicio: inicioMes }),
      this.getEventos({ dataInicio: inicioSemana }),
      this.getAgendaDia(hoje)
    ]).pipe(
      map(([todosEventos, eventosMes, eventosSemana, eventosHoje]) => {
        const totalEventos = todosEventos.length;
        const eventosEsteMes = eventosMes.length;
        const eventosEstaSemana = eventosSemana.length;
        const eventosHojeCount = eventosHoje.totalEventos;

        // Calcular horas de estudo
        const horasEstudoPlanejadas = todosEventos
          .filter(e => e.tipo === TipoEvento.ESTUDO)
          .reduce((acc, e) => acc + this.calcularDuracaoHoras(e), 0);

        const horasEstudoRealizadas = todosEventos
          .filter(e => e.tipo === TipoEvento.ESTUDO && e.status === StatusEvento.CONCLUIDO)
          .reduce((acc, e) => acc + this.calcularDuracaoHoras(e), 0);

        const taxaConclusao = totalEventos > 0 ?
          (todosEventos.filter(e => e.status === StatusEvento.CONCLUIDO).length / totalEventos) * 100 : 0;

        // Distribuição por tipos
        const estudo = todosEventos.filter(e => e.tipo === TipoEvento.ESTUDO).length;
        const prova = todosEventos.filter(e => e.tipo === TipoEvento.PROVA).length;
        const tarefa = todosEventos.filter(e => e.tipo === TipoEvento.TAREFA).length;
        const reuniao = todosEventos.filter(e => e.tipo === TipoEvento.REUNIAO).length;
        const outro = todosEventos.filter(e => e.tipo === TipoEvento.OUTRO).length;

        // Distribuição por prioridades
        const baixa = todosEventos.filter(e => e.prioridade === Prioridade.BAIXA).length;
        const media = todosEventos.filter(e => e.prioridade === Prioridade.MEDIA).length;
        const alta = todosEventos.filter(e => e.prioridade === Prioridade.ALTA).length;
        const urgente = todosEventos.filter(e => e.prioridade === Prioridade.URGENTE).length;

        return {
          totalEventos,
          eventosEsteMes,
          eventosEstaSemana,
          eventosHoje: eventosHojeCount,
          horasEstudoPlanejadas: Math.round(horasEstudoPlanejadas * 10) / 10,
          horasEstudoRealizadas: Math.round(horasEstudoRealizadas * 10) / 10,
          taxaConclusao: Math.round(taxaConclusao),
          distribuicaoTipos: { estudo, prova, tarefa, reuniao, outro },
          distribuicaoPrioridades: { baixa, media, alta, urgente }
        };
      })
    );
  }

  // Lembretes e notificações
  getLembretes(): Observable<Lembrete[]> {
    return this.http.get<Lembrete[]>(`${this.getApiUrl()}/lembretes`).pipe(
      map(lembretes => {
        this.lembretesSubject.next(lembretes);
        return lembretes;
      })
    );
  }

  marcarLembreteComoNotificado(id: string): Observable<void> {
    return this.http.patch<void>(`${this.getApiUrl()}/lembretes/${id}/notificar`, {});
  }

  // Relatórios
  getRelatorioPeriodo(dataInicio: Date, dataFim: Date): Observable<RelatorioPeriodo> {
    return this.getEventos({ dataInicio, dataFim }).pipe(
      map(eventos => {
        const eventosTotais = eventos.length;
        const eventosConcluidos = eventos.filter(e => e.status === StatusEvento.CONCLUIDO).length;
        const taxaConclusao = eventosTotais > 0 ? (eventosConcluidos / eventosTotais) * 100 : 0;

        const horasPlanejadas = eventos
          .filter(e => e.tipo === TipoEvento.ESTUDO)
          .reduce((acc, e) => acc + this.calcularDuracaoHoras(e), 0);

        const horasRealizadas = eventos
          .filter(e => e.tipo === TipoEvento.ESTUDO && e.status === StatusEvento.CONCLUIDO)
          .reduce((acc, e) => acc + this.calcularDuracaoHoras(e), 0);

        // Distribuição por matérias
        const distribuicaoMaterias = eventos.reduce((acc, evento) => {
          if (evento.materiaId && evento.materiaNome) {
            const existing = acc.find(m => m.materiaId === evento.materiaId);
            if (existing) {
              existing.eventos++;
              existing.horas += this.calcularDuracaoHoras(evento);
            } else {
              acc.push({
                materiaId: evento.materiaId,
                materiaNome: evento.materiaNome,
                eventos: 1,
                horas: this.calcularDuracaoHoras(evento)
              });
            }
          }
          return acc;
        }, [] as { materiaId: number; materiaNome: string; eventos: number; horas: number }[]);

        return {
          periodo: `${dataInicio.toLocaleDateString()} - ${dataFim.toLocaleDateString()}`,
          eventosTotais,
          eventosConcluidos,
          taxaConclusao: Math.round(taxaConclusao),
          horasPlanejadas: Math.round(horasPlanejadas * 10) / 10,
          horasRealizadas: Math.round(horasRealizadas * 10) / 10,
          distribuicaoMaterias
        };
      })
    );
  }

  getRelatorioComparativo(): Observable<RelatorioComparativo> {
    const hoje = new Date();
    const mesAtualInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const mesAtualFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    const mesAnteriorInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    const mesAnteriorFim = new Date(hoje.getFullYear(), hoje.getMonth(), 0);

    return combineLatest([
      this.getRelatorioPeriodo(mesAtualInicio, mesAtualFim),
      this.getRelatorioPeriodo(mesAnteriorInicio, mesAnteriorFim)
    ]).pipe(
      map(([periodoAtual, periodoAnterior]) => {
        const variacaoEventos = periodoAtual.eventosTotais - periodoAnterior.eventosTotais;
        const variacaoConclusao = periodoAtual.taxaConclusao - periodoAnterior.taxaConclusao;
        const variacaoHoras = periodoAtual.horasRealizadas - periodoAnterior.horasRealizadas;

        return {
          periodoAtual,
          periodoAnterior,
          variacaoEventos,
          variacaoConclusao,
          variacaoHoras
        };
      })
    );
  }

  // Cronograma de estudos
  getCronogramaEstudos(materiaId?: number): Observable<CronogramaEstudo[]> {
    const filter: EventoFilter = {
      tipo: TipoEvento.ESTUDO,
      status: StatusEvento.PENDENTE
    };

    if (materiaId) {
      filter.materiaId = materiaId;
    }

    return this.getEventos(filter).pipe(
      map(eventos => {
        // Agrupar por matéria
        const cronogramasPorMateria = eventos.reduce((acc, evento) => {
          if (!evento.materiaId || !evento.materiaNome) return acc;

          if (!acc[evento.materiaId]) {
            acc[evento.materiaId] = {
              materiaId: evento.materiaId,
              materiaNome: evento.materiaNome,
              eventos: [],
              horasTotais: 0,
              horasConcluidas: 0,
              progresso: 0
            };
          }

          const eventoEstudo: EventoEstudo = {
            eventoId: evento.id,
            materiaId: evento.materiaId,
            materiaNome: evento.materiaNome,
            titulo: evento.titulo,
            dataInicio: evento.dataInicio,
            duracao: this.calcularDuracaoMinutos(evento),
            prioridade: evento.prioridade,
            concluido: evento.status === StatusEvento.CONCLUIDO
          };

          acc[evento.materiaId].eventos.push(eventoEstudo);
          acc[evento.materiaId].horasTotais += this.calcularDuracaoHoras(evento);

          if (evento.status === StatusEvento.CONCLUIDO) {
            acc[evento.materiaId].horasConcluidas += this.calcularDuracaoHoras(evento);
          }

          return acc;
        }, {} as { [key: number]: CronogramaEstudo });

        // Calcular progresso
        Object.values(cronogramasPorMateria).forEach(cronograma => {
          cronograma.progresso = cronograma.horasTotais > 0 ?
            Math.round((cronograma.horasConcluidas / cronograma.horasTotais) * 100) : 0;
        });

        return Object.values(cronogramasPorMateria);
      })
    );
  }

// Agenda Semanal (itens simples de agenda)
  getAgendaSemanal(): Observable<AgendaResponseDTO[]> {
    return this.http.get<AgendaResponseDTO[]>(`${this.getAgendaApiUrl()}/semanal`);
  }

  getAgendaHoje(): Observable<AgendaResponseDTO[]> {
    return this.http.get<AgendaResponseDTO[]>(`${this.getAgendaApiUrl()}/hoje`);
  }

  criarItemAgenda(request: CriarItemAgendaRequest): Observable<AgendaResponseDTO> {
    return this.http.post<AgendaResponseDTO>(this.getAgendaApiUrl(), request);
  }

  atualizarItemAgenda(id: number, request: CriarItemAgendaRequest): Observable<AgendaResponseDTO> {
    return this.http.put<AgendaResponseDTO>(`${this.getAgendaApiUrl()}/${id}`, request);
  }

  excluirItemAgenda(id: number): Observable<void> {
    return this.http.delete<void>(`${this.getAgendaApiUrl()}/${id}`);
  }

  // Utilitários
  getConfig(): CalendarioConfig {
    return { ...this.config };
  }

  atualizarConfig(config: Partial<CalendarioConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private calcularDuracaoMinutos(evento: EventoResponseDTO): number {
    return Math.floor((evento.dataFim.getTime() - evento.dataInicio.getTime()) / (1000 * 60));
  }

  private calcularDuracaoHoras(evento: EventoResponseDTO): number {
    return (evento.dataFim.getTime() - evento.dataInicio.getTime()) / (1000 * 60 * 60);
  }

  private atualizarEventoNaLista(evento: EventoResponseDTO): void {
    const eventosAtuais = this.eventosSubject.value;
    const index = eventosAtuais.findIndex(e => e.id === evento.id);
    if (index !== -1) {
      eventosAtuais[index] = evento;
      this.eventosSubject.next([...eventosAtuais]);
    }
  }

  private removerEventoDaLista(id: number): void {
    const eventosAtuais = this.eventosSubject.value;
    const filtrados = eventosAtuais.filter(e => e.id !== id);
    this.eventosSubject.next(filtrados);
  }
}