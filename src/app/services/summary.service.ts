import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
}
