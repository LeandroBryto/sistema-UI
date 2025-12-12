import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SummaryService } from '../../services/summary.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  loading = false;
  error: string | null = null;
  carteira: unknown = null;
  resumo: unknown = null;

  constructor(
    private summary: SummaryService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  get username(): string | null {
    return this.auth.getUsername();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;
    this.carteira = null;
    this.resumo = null;

    this.summary.getCarteira().subscribe({
      next: (data) => {
        this.carteira = data;
        this.summary.getResumo().subscribe({
          next: (res) => {
            this.resumo = res;
            this.loading = false;
          },
          error: (e) => {
            this.loading = false;
            this.error =
              e?.error?.message ||
              'Erro ao carregar resumo. Tente novamente mais tarde.';
          },
        });
      },
      error: (e) => {
        this.loading = false;
        this.error =
          e?.error?.message ||
          'Erro ao carregar carteira. Tente novamente mais tarde.';
      },
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
