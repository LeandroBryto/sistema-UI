import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  cotacaoDolar(): Observable<CotacaoDolarDTO | null> {
    const url = `${this.env.apiBase()}/api/v1/meta/cotacao-dolar`;
    return this.http.get<CotacaoDolarDTO>(url, { observe: 'response' }).pipe(
      map((resp) => (resp.status === 200 ? resp.body! : null)),
      catchError(() => of(null))
    );
  }
}
