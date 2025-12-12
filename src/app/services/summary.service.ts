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

export interface CarteiraFinanceiraDTO {
  saldoAtual: number;
  saldoPrevistoDoMes: number;
  percentualComprometido: number;
  saudeFinanceira: 'OK' | 'ATENCAO' | 'CRITICA';
  graficoReceitasVsDespesasJson: string;
}

export interface ResumoFinanceiroDTO {
  totalReceitas: number;
  totalDespesas: number;
  saldoAtual: number;
  saldoPrevisto: number;
  rankingMaioresDespesas?: Record<string, number>;
  sugestaoAutomatica?: string;
  saudeFinanceira: 'OK' | 'ATENCAO' | 'CRITICA';
}

@Injectable({
  providedIn: 'root',
})
export class SummaryService {
  private readonly baseUrl =
    'https://sistema-financeiro-zaovxq.fly.dev/api/v1/summary';

  constructor(private http: HttpClient) {}

  getCarteira(): Observable<CarteiraFinanceiraDTO> {
    return this.http.get<CarteiraFinanceiraDTO>(`${this.baseUrl}/carteira`);
  }

  getResumo(): Observable<ResumoFinanceiroDTO> {
    return this.http.get<ResumoFinanceiroDTO>(`${this.baseUrl}/resumo`);
  }

  getRelatorioMensal(yearMonth: string): Observable<RelatorioMensalDTO> {
    const params = new HttpParams().set('yearMonth', yearMonth);
    return this.http.get<RelatorioMensalDTO>(`${this.baseUrl}/relatorio/mensal`, { params });
  }
}
