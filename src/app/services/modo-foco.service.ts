import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvService } from './env.service';

import {
  SessaoRequestDTO,
  SessaoResponseDTO,
  FinalizarEstudoRequestDTO
} from '../models/modo-foco.models';

@Injectable({
  providedIn: 'root'
})
export class ModoFocoService {

  constructor(
    private http: HttpClient,
    private env: EnvService
  ) { }

  private getApiUrl(): string {
    return `${this.env.apiEstudosBase()}/api/v1/sessoes`;
  }

  // Sessões CRUD
  registrarSessao(request: SessaoRequestDTO): Observable<SessaoResponseDTO> {
    return this.http.post<SessaoResponseDTO>(this.getApiUrl(), request);
  }

  finalizarEstudo(request: FinalizarEstudoRequestDTO): Observable<any> {
    return this.http.post(`${this.env.apiEstudosBase()}/api/v1/estudo/finalizar`, request);
  }

  listarHistorico(): Observable<SessaoResponseDTO[]> {
    return this.http.get<SessaoResponseDTO[]>(`${this.env.apiEstudosBase()}/api/v1/estudo/historico`);
  }
}