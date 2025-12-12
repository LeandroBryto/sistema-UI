import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  private readonly baseUrl =
    'https://sistema-financeiro-zaovxq.fly.dev/api/v1/receitas';

  constructor(private http: HttpClient) {}

  list(startDate?: string, endDate?: string): Observable<ReceitaResponse[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<ReceitaResponse[]>(this.baseUrl, { params });
  }

  create(body: ReceitaRequest): Observable<ReceitaResponse> {
    return this.http.post<ReceitaResponse>(this.baseUrl, body);
  }

  update(id: number, body: ReceitaRequest): Observable<ReceitaResponse> {
    return this.http.put<ReceitaResponse>(`${this.baseUrl}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
