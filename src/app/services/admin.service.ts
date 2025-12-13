import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import {
  AdminUserResponseDTO,
  MetricsSummaryDTO,
  AuditLogResponseDTO,
  ApplicationStatusDTO,
} from '../models/admin.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  private url(): string {
    return `${this.auth.apiBase()}/api/v1/admin`;
  }

  listUsers(): Observable<AdminUserResponseDTO[]> {
    return this.http.get<AdminUserResponseDTO[]>(`${this.url()}/users`);
  }

  activateUser(id: number): Observable<void> {
    return this.http.patch<void>(`${this.url()}/users/${id}/activate`, {});
  }

  deactivateUser(id: number): Observable<void> {
    return this.http.patch<void>(`${this.url()}/users/${id}/deactivate`, {});
  }

  changeRole(id: number, role: 'ADMIN' | 'USER'): Observable<void> {
    return this.http.patch<void>(`${this.url()}/users/${id}/role`, { role });
  }

  resetPassword(id: number, novaSenha: string): Observable<void> {
    return this.http.post<void>(`${this.url()}/users/${id}/reset-password`, { novaSenha });
  }

  metricsSummary(): Observable<MetricsSummaryDTO> {
    return this.http.get<MetricsSummaryDTO>(`${this.url()}/metrics/summary`);
  }

  lastLogins(limit = 10): Observable<AdminUserResponseDTO[]> {
    const params = new HttpParams().set('limit', String(limit));
    return this.http.get<AdminUserResponseDTO[]>(`${this.url()}/metrics/last-logins`, { params });
  }

  audit(limit = 50): Observable<AuditLogResponseDTO[]> {
    const params = new HttpParams().set('limit', String(limit));
    return this.http.get<AuditLogResponseDTO[]>(`${this.url()}/audit`, { params });
  }

  status(): Observable<ApplicationStatusDTO> {
    return this.http.get<ApplicationStatusDTO>(`${this.url()}/status`);
  }
}

