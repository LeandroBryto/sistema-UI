import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvService } from './env.service';

// Importando os modelos específicos
import {
  SessaoRequestDTO,
  SessaoResponseDTO
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

  listarHistorico(): Observable<SessaoResponseDTO[]> {
    return this.http.get<SessaoResponseDTO[]>(`${this.getApiUrl()}/historico`);
  }
}