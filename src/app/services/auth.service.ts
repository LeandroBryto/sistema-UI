import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginPayload, RegisterPayload, PasswordResetPayload, ForgotPasswordRequestDTO } from '../models/auth.models';
import { EnvService } from './env.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private env: EnvService) {}

  login(payload: LoginPayload): Observable<unknown> {
    return this.http.post(`${this.env.apiAuthBase()}/api/v1/auth/login`, payload).pipe(
      tap((res) => {
        try {
          localStorage.setItem('auth', JSON.stringify(res));
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('username', payload.username);
          const role = this.extractRoleFromAuth(res);
          if (role) localStorage.setItem('role', role);
        } catch {}
      })
    );
  }

  logout(): void {
    localStorage.removeItem('auth');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  getRole(): string | null {
    const saved = localStorage.getItem('role');
    if (saved) return saved;
    const token = this.readTokenFromAuth();
    const role = token ? this.extractRoleFromToken(token) : null;
    if (role) localStorage.setItem('role', role);
    return role;
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  register(payload: RegisterPayload): Observable<unknown> {
    return this.http.post(`${this.env.apiAuthBase()}/api/v1/auth/register`, payload);
  }

  resetPassword(payload: PasswordResetPayload): Observable<unknown> {
    return this.http.post(`${this.env.apiAuthBase()}/api/v1/auth/reset-password-direct`, payload);
  }

  forgotPassword(payload: ForgotPasswordRequestDTO): Observable<void> {
    return this.http.post<void>(`${this.env.apiAuthBase()}/api/v1/auth/forgot-password`, payload);
  }

  

  private readTokenFromAuth(): string | null {
    try {
      const raw = localStorage.getItem('auth');
      if (!raw) return null;
      const obj = JSON.parse(raw);
      return obj?.token || obj?.accessToken || null;
    } catch {
      return null;
    }
  }

  private extractRoleFromAuth(res: any): string | null {
    try {
      const r = res?.role || res?.user?.role || (Array.isArray(res?.roles) ? res.roles[0] : null);
      if (typeof r === 'string') return r.toUpperCase();
      const token = this.readTokenFromAuth();
      return token ? this.extractRoleFromToken(token) : null;
    } catch {
      return null;
    }
  }

  private extractRoleFromToken(token: string): string | null {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      const r = payload?.role || (Array.isArray(payload?.roles) ? payload.roles[0] : null) || (Array.isArray(payload?.authorities) ? payload.authorities[0] : null);
      return typeof r === 'string' ? r.toUpperCase() : null;
    } catch {
      return null;
    }
  }
}
