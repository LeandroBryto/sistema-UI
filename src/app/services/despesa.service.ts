import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { DespesaRequest, DespesaResponse } from '../models/despesa.models';

@Injectable({
  providedIn: 'root',
})
export class DespesaService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  // Produção: https://sistema-financeiro-zaovxq.fly.dev/api/v1/despesas
  // Local:    http://localhost:8080/api/v1/despesas
  private url(): string {
    return `${this.auth.apiBase()}/api/v1/despesas`;
  }

  list(startDate?: string, endDate?: string): Observable<DespesaResponse[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<DespesaResponse[]>(this.url(), { params });
  }

  create(body: DespesaRequest): Observable<DespesaResponse> {
    return this.http.post<DespesaResponse>(this.url(), body);
  }

  update(id: number, body: DespesaRequest): Observable<DespesaResponse> {
    return this.http.put<DespesaResponse>(`${this.url()}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url()}/${id}`);
}
}
