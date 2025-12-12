import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RelatorioMensalDTO {
  periodo: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  rankingReceitasPorCategoria?: Record<string, number>;
  rankingDespesasPorCategoria?: Record<string, number>;
  mediaGastosPorCategoria?: Record<string, number>;
  analiseAnomalias?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SummaryService {
  private readonly baseUrl =
    'https://sistema-financeiro-zaovxq.fly.dev/api/v1/summary';

  constructor(private http: HttpClient) {}

  getCarteira(): Observable<unknown> {
    return this.http.get(`${this.baseUrl}/carteira`);
  }

  getResumo(): Observable<unknown> {
    return this.http.get(`${this.baseUrl}/resumo`);
  }

  getRelatorioMensal(yearMonth: string): Observable<RelatorioMensalDTO> {
    const params = new HttpParams().set('yearMonth', yearMonth);
    return this.http.get<RelatorioMensalDTO>(`${this.baseUrl}/relatorio/mensal`, { params });
  }
}
