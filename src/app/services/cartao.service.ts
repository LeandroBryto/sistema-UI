import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvService } from './env.service';
import { Observable } from 'rxjs';
import { CartaoCreditoRequest, CartaoCreditoResponse, FaturaResponse } from '../models/cartao.models';

@Injectable({
  providedIn: 'root',
})
export class CartaoService {
  constructor(private http: HttpClient, private env: EnvService) {}

  private get baseUrl(): string {
    return `${this.env.apiBase()}/api/v1/cartoes-credito`;
  }

  list(): Observable<CartaoCreditoResponse[]> {
    return this.http.get<CartaoCreditoResponse[]>(this.baseUrl);
  }

  create(body: CartaoCreditoRequest): Observable<CartaoCreditoResponse> {
    return this.http.post<CartaoCreditoResponse>(this.baseUrl, body);
  }

  listFaturas(idCartao: number): Observable<FaturaResponse[]> {
    return this.http.get<FaturaResponse[]>(`${this.baseUrl}/${idCartao}/faturas`);
  }

  payFatura(idCartao: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${idCartao}/pagar`, {});
  }
}
