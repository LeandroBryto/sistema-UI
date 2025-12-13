import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvService } from './env.service';
import { Observable } from 'rxjs';
import { GoalRequest, GoalResponse } from '../models/goal.models';

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
}
