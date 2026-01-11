import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { LoginPayload, RegisterPayload, PasswordResetPayload, ForgotPasswordRequestDTO, ChangePasswordPayload } from '../models/auth.models';
import { EnvService } from './env.service';

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authState = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient, private env: EnvService) {
    this.loadAuthState();
  }

  private loadAuthState() {
    const auth = localStorage.getItem('auth');
    if (auth) {
      this.authState.next(JSON.parse(auth));
    }
  }

  get authState$() {
    return this.authState.asObservable();
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.env.apiAuthBase()}/api/v1/auth/login`, payload).pipe(
      tap((res) => {
        const authData = {
          accessToken: res.access_token,
          refreshToken: res.refresh_token
        };
        localStorage.setItem('auth', JSON.stringify(authData));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', payload.username);
        this.authState.next(authData);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('auth');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    this.authState.next(null);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  getRole(): string | null {
    const token = this.getAccessToken();
    return token ? this.extractRoleFromToken(token) : null;
  }

  getPlano(): string | null {
    const token = this.getAccessToken();
    return token ? this.extractPlanoFromToken(token) : null;
  }

  getAccessToken(): string | null {
    const auth = this.authState.value;
    return auth?.accessToken || null;
  }

  getRefreshToken(): string | null {
    const auth = this.authState.value;
    return auth?.refreshToken || null;
  }

  isAdmin(): boolean {
    const role = this.getRole();
    const username = this.getUsername();
    
    const hasAdminRole = role === 'ADMIN' || 
                         role === 'ROLE_ADMIN' || 
                         role === 'admin' || 
                         role === 'role_admin';
                         
    const isUserAdmin = username?.toLowerCase() === 'admin';
    
    return hasAdminRole || isUserAdmin;
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.env.apiAuthBase()}/api/v1/auth/register`, payload).pipe(
      tap((res) => {
        const authData = {
          accessToken: res.access_token,
          refreshToken: res.refresh_token
        };
        localStorage.setItem('auth', JSON.stringify(authData));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', payload.username);
        this.authState.next(authData);
      })
    );
  }

  resetPassword(payload: PasswordResetPayload): Observable<unknown> {
    return this.http.post(`${this.env.apiAuthBase()}/api/v1/auth/redefinir-senha`, payload);
  }

  forgotPassword(payload: ForgotPasswordRequestDTO): Observable<void> {
    return this.http.post<void>(`${this.env.apiAuthBase()}/api/v1/auth/esqueci-senha`, payload);
  }

  changePassword(payload: ChangePasswordPayload): Observable<void> {
    return this.http.post<void>(`${this.env.apiAuthBase()}/api/v1/auth/alterar-senha`, payload);
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    return this.http.post<AuthResponse>(`${this.env.apiAuthBase()}/api/v1/auth/refresh`, { refreshToken }).pipe(
      tap((res) => {
        const authData = {
          accessToken: res.access_token,
          refreshToken: res.refresh_token
        };
        localStorage.setItem('auth', JSON.stringify(authData));
        this.authState.next(authData);
      })
    );
  }

  upgrade(): Observable<any> {
    const username = this.getUsername();
    if (!username) {
      throw new Error('No username available');
    }
    return this.http.patch(`${this.env.apiAuthBase()}/api/v1/users/${username}/upgrade`, {}).pipe(
      tap(() => {
        // Após upgrade, tentar refresh token para obter novo payload com plano atualizado
        const refreshToken = this.getRefreshToken();
        if (refreshToken) {
          this.refreshToken().subscribe();
        }
      })
    );
  }

  private extractRoleFromToken(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const r = payload?.role || (Array.isArray(payload?.roles) ? payload.roles[0] : null) || (Array.isArray(payload?.authorities) ? payload.authorities[0] : null);
      return typeof r === 'string' ? r.toUpperCase() : null;
    } catch {
      return null;
    }
  }

  private extractPlanoFromToken(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.plano || null;
    } catch {
      return null;
    }
  }
}
