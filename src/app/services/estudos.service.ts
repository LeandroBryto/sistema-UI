import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvService } from './env.service';

// Importando os modelos criados
import {
  DadosGamificacaoEntity,
  GamificacaoResponseDTO,
  MateriaEntity,
  MateriaRequestDTO,
  MateriaResponseDTO,
  TopicoEntity,
  SessaoEstudoEntity,
  FlashcardEntity,
  CriarTopicoRequest,
  CriarSessaoRequest,
  CriarFlashcardRequest,
  AvaliarFlashcardRequest,
  SessaoResponse,
  DashboardResponse,
  DificuldadeFlashcard,
  DiaSemana,
  FlashcardRequestDTO,
  FlashcardResponseDTO,
  RevisaoFlashcardDTO,
  TarefaEstudoRequestDTO,
  TarefaEstudoResponseDTO,
  TarefaStatus,
  CertificadoResponseDTO
} from '../models/estudos.models';

@Injectable({
  providedIn: 'root'
})
export class EstudosService {

  constructor(
    private http: HttpClient,
    private env: EnvService
  ) { }

  private getApiUrl(): string {
    return `${this.env.apiEstudosBase()}/api/v1`;
  }

  // Dashboard
  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.getApiUrl()}/dashboard`);
  }

  getGamificacao(): Observable<GamificacaoResponseDTO> {
    return this.http.get<GamificacaoResponseDTO>(`${this.getApiUrl()}/gamificacao/perfil`);
  }

  // Matérias - Baseado no backend Java
  getMaterias(): Observable<MateriaResponseDTO[]> {
    return this.http.get<MateriaResponseDTO[]>(`${this.getApiUrl()}/materias`);
  }

  getMateriaById(id: number): Observable<MateriaResponseDTO> {
    return this.http.get<MateriaResponseDTO>(`${this.getApiUrl()}/materias/${id}`);
  }

  criarMateria(request: MateriaRequestDTO): Observable<MateriaResponseDTO> {
    return this.http.post<MateriaResponseDTO>(`${this.getApiUrl()}/materias`, request);
  }

  atualizarMateria(id: number, materia: Partial<MateriaEntity>): Observable<MateriaResponseDTO> {
    return this.http.put<MateriaResponseDTO>(`${this.getApiUrl()}/materias/${id}`, materia);
  }

  arquivarMateria(id: number): Observable<void> {
    return this.http.patch<void>(`${this.getApiUrl()}/materias/${id}/arquivar`, {});
  }

  excluirMateria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.getApiUrl()}/materias/${id}`);
  }

  // Tópicos
  getTopicosByMateria(materiaId: number): Observable<TopicoEntity[]> {
    return this.http.get<TopicoEntity[]>(`${this.getApiUrl()}/materias/${materiaId}/topicos`);
  }

  criarTopico(request: CriarTopicoRequest): Observable<TopicoEntity> {
    return this.http.post<TopicoEntity>(`${this.getApiUrl()}/topicos`, request);
  }

  atualizarTopico(id: number, topico: Partial<TopicoEntity>): Observable<TopicoEntity> {
    return this.http.put<TopicoEntity>(`${this.getApiUrl()}/topicos/${id}`, topico);
  }

  excluirTopico(id: number): Observable<void> {
    return this.http.delete<void>(`${this.getApiUrl()}/topicos/${id}`);
  }

  // Sessões de Estudo
  iniciarSessao(request: CriarSessaoRequest): Observable<SessaoResponse> {
    return this.http.post<SessaoResponse>(`${this.getApiUrl()}/sessoes/iniciar`, request);
  }

  finalizarSessao(sessaoId: number, minutosTotais: number, anotacoes: string): Observable<SessaoResponse> {
    return this.http.patch<SessaoResponse>(`${this.getApiUrl()}/sessoes/${sessaoId}/finalizar`, {
      minutosTotais,
      anotacoes
    });
  }

  getSessoes(): Observable<SessaoEstudoEntity[]> {
    return this.http.get<SessaoEstudoEntity[]>(`${this.getApiUrl()}/sessoes`);
  }

  // Flashcards
  getFlashcardsByMateria(materiaId: number): Observable<FlashcardEntity[]> {
    return this.http.get<FlashcardEntity[]>(`${this.getApiUrl()}/flashcards/materia/${materiaId}`);
  }

  getFlashcardsParaRevisao(): Observable<FlashcardResponseDTO[]> {
    return this.http.get<FlashcardResponseDTO[]>(`${this.getApiUrl()}/flashcards/revisao`);
  }

  criarFlashcard(request: FlashcardRequestDTO): Observable<FlashcardResponseDTO> {
    return this.http.post<FlashcardResponseDTO>(`${this.getApiUrl()}/flashcards`, request);
  }

  revisarFlashcard(id: number, request: RevisaoFlashcardDTO): Observable<FlashcardResponseDTO> {
    return this.http.post<FlashcardResponseDTO>(`${this.getApiUrl()}/flashcards/${id}/revisar`, request);
  }

  excluirFlashcard(id: number): Observable<void> {
    return this.http.delete<void>(`${this.getApiUrl()}/flashcards/${id}`);
  }

  getTarefas(): Observable<TarefaEstudoResponseDTO[]> {
    return this.http.get<TarefaEstudoResponseDTO[]>(`${this.getApiUrl()}/tarefas`);
  }

  criarTarefa(request: TarefaEstudoRequestDTO): Observable<TarefaEstudoResponseDTO> {
    return this.http.post<TarefaEstudoResponseDTO>(`${this.getApiUrl()}/tarefas`, request);
  }

  atualizarTarefa(id: number, request: TarefaEstudoRequestDTO): Observable<TarefaEstudoResponseDTO> {
    return this.http.put<TarefaEstudoResponseDTO>(`${this.getApiUrl()}/tarefas/${id}`, request);
  }

  atualizarStatusTarefa(id: number, status: TarefaStatus): Observable<TarefaEstudoResponseDTO> {
    return this.http.patch<TarefaEstudoResponseDTO>(`${this.getApiUrl()}/tarefas/${id}/status`, null, {
      params: { status }
    });
  }

  deletarTarefa(id: number): Observable<void> {
    return this.http.delete<void>(`${this.getApiUrl()}/tarefas/${id}`);
  }

  getCertificados(): Observable<CertificadoResponseDTO[]> {
    return this.http.get<CertificadoResponseDTO[]>(`${this.getApiUrl()}/certificados`);
  }

  uploadCertificado(titulo: string, arquivo: File): Observable<CertificadoResponseDTO> {
    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('arquivo', arquivo);
    return this.http.post<CertificadoResponseDTO>(`${this.getApiUrl()}/certificados`, formData);
  }

  downloadCertificado(id: number): Observable<Blob> {
    return this.http.get(`${this.getApiUrl()}/certificados/${id}/download`, {
      responseType: 'blob'
    });
  }

  deletarCertificado(id: number): Observable<void> {
    return this.http.delete<void>(`${this.getApiUrl()}/certificados/${id}`);
  }

  // Utilitários
  getDiasSemana(): DiaSemana[] {
    return [
      DiaSemana.SEGUNDA,
      DiaSemana.TERCA,
      DiaSemana.QUARTA,
      DiaSemana.QUINTA,
      DiaSemana.SEXTA,
      DiaSemana.SABADO,
      DiaSemana.DOMINGO
    ];
  }

  getDificuldadesFlashcard(): DificuldadeFlashcard[] {
    return [
      DificuldadeFlashcard.ERROU,
      DificuldadeFlashcard.DIFICIL,
      DificuldadeFlashcard.BOM,
      DificuldadeFlashcard.FACIL
    ];
  }

  formatarDiaSemana(dia: DiaSemana): string {
    const mapa = {
      [DiaSemana.DOMINGO]: 'Domingo',
      [DiaSemana.SEGUNDA]: 'Segunda',
      [DiaSemana.TERCA]: 'Terça',
      [DiaSemana.QUARTA]: 'Quarta',
      [DiaSemana.QUINTA]: 'Quinta',
      [DiaSemana.SEXTA]: 'Sexta',
      [DiaSemana.SABADO]: 'Sábado'
    };
    return mapa[dia] || dia;
  }

  formatarDificuldade(dificuldade: DificuldadeFlashcard): string {
    const mapa = {
      [DificuldadeFlashcard.NAOVISTO]: 'Não visto',
      [DificuldadeFlashcard.ERROU]: 'Errei',
      [DificuldadeFlashcard.DIFICIL]: 'Difícil',
      [DificuldadeFlashcard.BOM]: 'Bom',
      [DificuldadeFlashcard.FACIL]: 'Fácil'
    };
    return mapa[dificuldade] || dificuldade;
  }
}
