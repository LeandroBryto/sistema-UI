import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

export interface GoalRequest {
  meta: string;
  valorMeta: number;
  valorAcumulado?: number;
}

export interface GoalResponse {
  id: number;
  meta: string;
  valorMeta: number;
  valorAcumulado: number;
  dataCriacao: string;
  previsaoConclusao: string;
  percentualConcluido: number;
}

@Injectable({
  providedIn: 'root',
})
export class GoalService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  // Produção: https://sistema-financeiro-zaovxq.fly.dev/api/v1/goals
  // Local:    http://localhost:8080/api/v1/goals
  private url(): string {
    return `${this.auth.apiBase()}/api/v1/goals`;
  }

  list(): Observable<GoalResponse[]> {
    return this.http.get<GoalResponse[]>(this.url());
  }

  create(body: GoalRequest): Observable<GoalResponse> {
    return this.http.post<GoalResponse>(this.url(), body);
  }
}
