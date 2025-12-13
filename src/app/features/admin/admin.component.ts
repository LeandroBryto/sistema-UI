import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  loading = false;
  error: string | null = null;
  data: any = null;

  // Produção: https://sistema-financeiro-zaovxq.fly.dev/api/v1/admin
  // Local:    http://localhost:8080/api/v1/admin
  private url(): string {
    return `${this.auth.apiBase()}/api/v1/admin`;
  }

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.data = null;
    this.http.get(`${this.url()}/dashboard`).subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
      },
      error: (e) => {
        this.loading = false;
        this.error =
          e?.status === 403
            ? 'Acesso negado (ADMIN apenas).'
            : e?.status === 401
            ? 'Sessão expirada. Faça login novamente.'
            : e?.error?.message || 'Erro ao carregar Painel de Controle.';
      },
    });
  }
}
