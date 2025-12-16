import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { EnvService } from './env.service';
import { catchError, map } from 'rxjs/operators';

export interface TaxaItem {
  nome: string;
  valor: number;
}

export interface TaxasDTO {
  selic: number;
  cdi: number;
  ipca: number;
}

@Injectable({
  providedIn: 'root'
})
export class TaxasService {

  constructor(private http: HttpClient, private env: EnvService) {}

  private url(): string {
    return `${this.env.apiBase()}/api/v1/taxas`;
  }

  getTaxas(): Observable<TaxasDTO> {
    return this.http.get<TaxaItem[]>(this.url()).pipe(
      map(items => {
        const taxas: TaxasDTO = { selic: 0, cdi: 0, ipca: 0 };
        if (Array.isArray(items)) {
          items.forEach(item => {
            const nome = (item.nome || '').toUpperCase();
            if (nome === 'SELIC') taxas.selic = item.valor;
            if (nome === 'CDI') taxas.cdi = item.valor;
            if (nome === 'IPCA') taxas.ipca = item.valor;
          });
        }
        return taxas;
      }),
      catchError(error => {
        console.error('Erro ao buscar taxas', error);
        return of({ selic: 0, cdi: 0, ipca: 0 });
      })
    );
  }
}
