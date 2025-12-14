import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EnvService } from './env.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { GoalRequest, GoalResponse, CotacaoDolarDTO } from '../models/goal.models';

@Injectable({
  providedIn: 'root',
})
export class GoalService {
  constructor(private http: HttpClient, private env: EnvService) {}

  // Produção: https://sistema-financeiro-zaovxq.fly.dev/api/v1/goals
  // Local:    http://localhost:8080/api/v1/goals
  private url(): string {
    return `${this.env.apiBase()}/api/v1/goals`;
  }

  list(): Observable<GoalResponse[]> {
    return this.http.get<GoalResponse[]>(this.url());
  }

  create(body: GoalRequest): Observable<GoalResponse> {
    return this.http.post<GoalResponse>(this.url(), body);
  }

  cotacaoDolar(dataInicial?: string, dataFinal?: string): Observable<CotacaoDolarDTO | null> {
    const url = `${this.env.apiBase()}/api/v1/meta/cotacao-dolar`;
    let params = new HttpParams();
    if (dataInicial) params = params.set('dataInicial', dataInicial);
    if (dataFinal) params = params.set('dataFinal', dataFinal);
    return this.http.get<CotacaoDolarDTO>(url, { observe: 'response', params }).pipe(
      map((resp) => (resp.status === 200 ? resp.body! : null)),
      catchError(() => of(null))
    );
  }
}
