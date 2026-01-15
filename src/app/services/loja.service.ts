import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvService } from './env.service';
import { ItemLojaDTO } from '../models/loja.models';

@Injectable({
  providedIn: 'root'
})
export class LojaService {

  constructor(
    private http: HttpClient,
    private env: EnvService
  ) { }

  private getApiUrl(): string {
    return `${this.env.apiEstudosBase()}/api/v1/loja`;
  }

  getItens(): Observable<ItemLojaDTO[]> {
    return this.http.get<ItemLojaDTO[]>(`${this.getApiUrl()}/itens`);
  }

  comprarItem(itemId: number): Observable<void> {
    return this.http.post<void>(`${this.getApiUrl()}/comprar/${itemId}`, {});
  }
}
