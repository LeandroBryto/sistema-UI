import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EnvService } from './env.service';
import { Observable } from 'rxjs';
import { CotacaoAtualResponse, CotacaoDia } from '../models/cotacao.models';

@Injectable({
  providedIn: 'root',
})
export class CotacaoService {
  constructor(private http: HttpClient, private env: EnvService) {}

  private get baseUrl(): string {
    return `${this.env.apiBase()}/api/v1/cotacao/dolar`;
  }

  getAtual(): Observable<CotacaoAtualResponse> {
    return this.http.get<CotacaoAtualResponse>(`${this.baseUrl}/atual`);
  }

  getHistorico(inicio?: string, fim?: string): Observable<CotacaoDia[]> {
    let params = new HttpParams();
    if (inicio) params = params.set('inicio', inicio);
    if (fim) params = params.set('fim', fim);
    return this.http.get<CotacaoDia[]>(`${this.baseUrl}/historico`, { params });
  }
}
