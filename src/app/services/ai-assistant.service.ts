import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { EnvService } from './env.service';
import { AiAssistantRequestDTO, AiAssistantResponseDTO } from '../models/ai.models';

@Injectable({ providedIn: 'root' })
export class AiAssistantService {
  private cache: { message: string; response: AiAssistantResponseDTO } | null = null;

  constructor(private http: HttpClient, private env: EnvService) {}

  private url(): string {
    return `${this.env.apiBase()}/api/v1/ai/assistant`;
  }

  ask(body: AiAssistantRequestDTO): Observable<AiAssistantResponseDTO> {
    if (this.cache && this.cache.message === body.message) {
      return of(this.cache.response);
    }
    return new Observable<AiAssistantResponseDTO>((observer) => {
      this.http.post<AiAssistantResponseDTO>(this.url(), body).subscribe({
        next: (res) => {
          this.cache = { message: body.message, response: res };
          observer.next(res);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        },
      });
    });
  }
}
