import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginPayload {
  username: string;
  senha: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  telefone: string;
  senha: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly loginUrl =
    'https://sistema-financeiro-zaovxq.fly.dev/api/v1/auth/login';
  private readonly registerUrl =
    'https://sistema-financeiro-zaovxq.fly.dev/api/v1/auth/register';

  constructor(private http: HttpClient) {}

  login(payload: LoginPayload): Observable<unknown> {
    return this.http.post(this.loginUrl, payload).pipe(
      tap((res) => {
        try {
          localStorage.setItem('auth', JSON.stringify(res));
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('username', payload.username);
        } catch {}
      })
    );
  }

  logout(): void {
    localStorage.removeItem('auth');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  register(payload: RegisterPayload): Observable<unknown> {
    return this.http.post(this.registerUrl, payload);
  }
}
