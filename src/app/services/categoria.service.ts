import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvService } from './env.service';
import { Observable } from 'rxjs';
import { CategoriaRequest, CategoriaResponse } from '../models/categoria.models';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  constructor(private http: HttpClient, private env: EnvService) {}

  private get baseUrl(): string {
    return `${this.env.apiBase()}/api/v1/categorias`;
  }

  list(): Observable<CategoriaResponse[]> {
    return this.http.get<CategoriaResponse[]>(this.baseUrl);
  }

  create(body: CategoriaRequest): Observable<CategoriaResponse> {
    return this.http.post<CategoriaResponse>(this.baseUrl, body);
  }

  update(id: number, body: CategoriaRequest): Observable<CategoriaResponse> {
    return this.http.put<CategoriaResponse>(`${this.baseUrl}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
