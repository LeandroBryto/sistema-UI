import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EnvService } from './env.service';
import { Observable } from 'rxjs';
import { OrcamentoRequest, OrcamentoResponse } from '../models/orcamento.models';

@Injectable({
  providedIn: 'root',
})
export class OrcamentoService {
  constructor(private http: HttpClient, private env: EnvService) {}

  private get baseUrl(): string {
    return `${this.env.apiBase()}/api/v1/orcamentos`;
  }

  list(mes?: number, ano?: number): Observable<OrcamentoResponse[]> {
    let params = new HttpParams();
    if (mes) params = params.set('mes', mes);
    if (ano) params = params.set('ano', ano);
    return this.http.get<OrcamentoResponse[]>(this.baseUrl, { params });
  }

  save(body: OrcamentoRequest): Observable<OrcamentoResponse> {
    return this.http.post<OrcamentoResponse>(this.baseUrl, body);
  }
}
