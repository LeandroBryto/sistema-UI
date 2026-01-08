import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { EnvService } from './env.service';

// Importando os modelos específicos
import {
  MateriaEntity,
  MateriaRequestDTO,
  MateriaResponseDTO,
  TopicoEntity,
  TopicoRequestDTO,
  TopicoResponseDTO,
  IconeOption,
  MateriaStats
} from '../models/materias.models';

@Injectable({
  providedIn: 'root'
})
export class MateriasService {

  constructor(
    private http: HttpClient,
    private env: EnvService
  ) { }

  private getApiUrl(): string {
    return `${this.env.apiEstudosBase()}/api/v1/materias`;
  }

  // Matérias CRUD
  getMaterias(): Observable<MateriaResponseDTO[]> {
    return this.http.get<MateriaResponseDTO[]>(this.getApiUrl());
  }

  getMateriaById(id: number): Observable<MateriaResponseDTO> {
    return this.http.get<MateriaResponseDTO>(`${this.getApiUrl()}/${id}`);
  }

  criarMateria(request: MateriaRequestDTO): Observable<MateriaResponseDTO> {
    return this.http.post<MateriaResponseDTO>(this.getApiUrl(), request);
  }

  atualizarMateria(id: number, materia: Partial<MateriaEntity>): Observable<MateriaResponseDTO> {
    return this.http.put<MateriaResponseDTO>(`${this.getApiUrl()}/${id}`, materia);
  }

  arquivarMateria(id: number): Observable<void> {
    return this.http.patch<void>(`${this.getApiUrl()}/${id}/arquivar`, {});
  }

  excluirMateria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.getApiUrl()}/${id}`);
  }

  // Tópicos CRUD
  getTopicosByMateria(materiaId: number): Observable<TopicoResponseDTO[]> {
    return this.http.get<TopicoResponseDTO[]>(`${this.getApiUrl()}/${materiaId}/topicos`);
  }

  criarTopico(request: TopicoRequestDTO): Observable<TopicoResponseDTO> {
    return this.http.post<TopicoResponseDTO>(`${this.env.apiBase()}/api/v1/topicos`, request);
  }

  atualizarTopico(id: number, topico: Partial<TopicoEntity>): Observable<TopicoResponseDTO> {
    return this.http.put<TopicoResponseDTO>(`${this.env.apiBase()}/api/v1/topicos/${id}`, topico);
  }

  excluirTopico(id: number): Observable<void> {
    return this.http.delete<void>(`${this.env.apiBase()}/api/v1/topicos/${id}`);
  }

  // Estatísticas
  getMateriaStats(): Observable<MateriaStats> {
    return this.getMaterias().pipe(
      map(materias => ({
        totalMaterias: materias.length,
        materiasAtivas: materias.filter(m => !m.arquivada).length,
        materiasArquivadas: materias.filter(m => m.arquivada).length,
        limiteFree: 3
      }))
    );
  }

  // Utilitários
  getIconesDisponiveis(): IconeOption[] {
    return [
      { label: 'Livro', value: 'pi pi-book' },
      { label: 'Calculadora', value: 'pi pi-calculator' },
      { label: 'Relógio', value: 'pi pi-clock' },
      { label: 'Globo', value: 'pi pi-globe' },
      { label: 'Coração', value: 'pi pi-heart' },
      { label: 'Estrela', value: 'pi pi-star' },
      { label: 'Lápis', value: 'pi pi-pencil' },
      { label: 'Atômico', value: 'pi pi-atom' },
      { label: 'DNA', value: 'pi pi-dna' },
      { label: 'Microscópio', value: 'pi pi-microscope' }
    ];
  }

  validarCorHex(cor: string): boolean {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(cor);
  }

  gerarCorAleatoria(): string {
    const cores = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
      '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
    ];
    return cores[Math.floor(Math.random() * cores.length)];
  }
}