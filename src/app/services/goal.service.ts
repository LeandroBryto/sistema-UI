import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  private readonly baseUrl =
    'https://sistema-financeiro-zaovxq.fly.dev/api/v1/goals';

  constructor(private http: HttpClient) {}

  list(): Observable<GoalResponse[]> {
    return this.http.get<GoalResponse[]>(this.baseUrl);
  }

  create(body: GoalRequest): Observable<GoalResponse> {
    return this.http.post<GoalResponse>(this.baseUrl, body);
  }
}
