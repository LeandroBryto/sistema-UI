import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

export interface ReceitaRequest {
  descricao: string;
  categoria: string;
  valor: number;
  data: string;
  formaRecebimento: string;
  recorrente?: boolean;
  observacoes?: string;
}

export interface ReceitaResponse extends ReceitaRequest {
  id: number;
}

@Injectable({
  providedIn: 'root',
})
export class ReceitaService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  // Produção: https://sistema-financeiro-zaovxq.fly.dev/api/v1/receitas
  // Local:    http://localhost:8080/api/v1/receitas
  private url(): string {
    return `${this.auth.apiBase()}/api/v1/receitas`;
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
