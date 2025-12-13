import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EnvService } from './env.service';
import { Observable } from 'rxjs';
import { RelatorioMensalDTO, CarteiraFinanceiraDTO, ResumoFinanceiroDTO } from '../models/summary.models';

@Injectable({
  providedIn: 'root',
})
export class SummaryService {
  constructor(private http: HttpClient, private env: EnvService) {}

  // Produção: https://sistema-financeiro-zaovxq.fly.dev/api/v1/summary
  // Local:    http://localhost:8080/api/v1/summary
  private url(): string {
    return `${this.env.apiBase()}/api/v1/summary`;
  }

  getCarteira(): Observable<CarteiraFinanceiraDTO> {
    return this.http.get<CarteiraFinanceiraDTO>(`${this.url()}/carteira`);
  }

  getResumo(): Observable<ResumoFinanceiroDTO> {
    return this.http.get<ResumoFinanceiroDTO>(`${this.url()}/resumo`);
  }

  getRelatorioMensal(yearMonth: string): Observable<RelatorioMensalDTO> {
    const params = new HttpParams().set('yearMonth', yearMonth);
    return this.http.get<RelatorioMensalDTO>(`${this.url()}/relatorio/mensal`, { params });
  }
}
