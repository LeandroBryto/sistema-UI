import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvService } from './env.service';

// Importando os modelos criados
import {
  DadosGamificacaoEntity,
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
  DiaSemana
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

  getGamificacao(): Observable<DadosGamificacaoEntity> {
    return this.http.get<DadosGamificacaoEntity>(`${this.getApiUrl()}/gamificacao`);
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

  getFlashcardsParaRevisao(): Observable<FlashcardEntity[]> {
    return this.http.get<FlashcardEntity[]>(`${this.getApiUrl()}/flashcards/revisao`);
  }

  criarFlashcard(request: CriarFlashcardRequest): Observable<FlashcardEntity> {
    return this.http.post<FlashcardEntity>(`${this.getApiUrl()}/flashcards`, request);
  }

  avaliarFlashcard(request: AvaliarFlashcardRequest): Observable<FlashcardEntity> {
    return this.http.post<FlashcardEntity>(`${this.getApiUrl()}/flashcards/avaliar`, request);
  }

  excluirFlashcard(id: number): Observable<void> {
    return this.http.delete<void>(`${this.getApiUrl()}/flashcards/${id}`);
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
      [DificuldadeFlashcard.ERROU]: 'Errei',
      [DificuldadeFlashcard.DIFICIL]: 'Difícil',
      [DificuldadeFlashcard.BOM]: 'Bom',
      [DificuldadeFlashcard.FACIL]: 'Fácil'
    };
    return mapa[dificuldade] || dificuldade;
  }
}