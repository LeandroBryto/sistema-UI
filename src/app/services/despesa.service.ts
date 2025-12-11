import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DespesaRequest {
  descricao: string;
  categoria: string;
  valor: number;
  data: string;
  formaPagamento: string;
  recorrente?: boolean;
  notificarAntesVencimento?: number;
  statusPagamento: string;
  observacoes?: string;
}

export interface DespesaResponse extends DespesaRequest {
  id: number;
}

@Injectable({
  providedIn: 'root',
})
export class DespesaService {
  private readonly baseUrl =
    'https://sistema-financeiro-zaovxq.fly.dev/api/v1/despesas';

  constructor(private http: HttpClient) {}

  list(startDate?: string, endDate?: string): Observable<DespesaResponse[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<DespesaResponse[]>(this.baseUrl, { params });
  }

  create(body: DespesaRequest): Observable<DespesaResponse> {
    return this.http.post<DespesaResponse>(this.baseUrl, body);
  }

  update(id: number, body: DespesaRequest): Observable<DespesaResponse> {
    return this.http.put<DespesaResponse>(`${this.baseUrl}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
