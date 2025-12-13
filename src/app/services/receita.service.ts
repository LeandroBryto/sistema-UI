import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EnvService } from './env.service';
import { Observable } from 'rxjs';
import { ReceitaRequest, ReceitaResponse } from '../models/receita.models';

@Injectable({
  providedIn: 'root',
})
export class ReceitaService {
  constructor(private http: HttpClient, private env: EnvService) {}

  // Produção: https://sistema-financeiro-zaovxq.fly.dev/api/v1/receitas
  // Local:    http://localhost:8080/api/v1/receitas
  private url(): string {
    return `${this.env.apiBase()}/api/v1/receitas`;
  }

  list(startDate: string, endDate: string): Observable<ReceitaResponse[]> {
    const params = new HttpParams().set('startDate', startDate).set('endDate', endDate);
    return this.http.get<ReceitaResponse[]>(this.url(), { params });
  }

  create(body: ReceitaRequest): Observable<ReceitaResponse> {
    return this.http.post<ReceitaResponse>(this.url(), body);
  }

  update(id: number, body: ReceitaRequest): Observable<ReceitaResponse> {
    return this.http.put<ReceitaResponse>(`${this.url()}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url()}/${id}`);
}
}
