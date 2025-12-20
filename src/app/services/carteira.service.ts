import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvService } from './env.service';
import { Observable } from 'rxjs';
import { CarteiraRequest, CarteiraResponse, TransferenciaRequest } from '../models/carteira.models';

@Injectable({
  providedIn: 'root',
})
export class CarteiraService {
  constructor(private http: HttpClient, private env: EnvService) {}

  private get baseUrl(): string {
    return `${this.env.apiBase()}/api/v1/contas`;
  }

  list(): Observable<CarteiraResponse[]> {
    return this.http.get<CarteiraResponse[]>(this.baseUrl);
  }

  create(body: CarteiraRequest): Observable<CarteiraResponse> {
    return this.http.post<CarteiraResponse>(this.baseUrl, body);
  }

  transfer(body: TransferenciaRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/transferir`, body);
  }
}
