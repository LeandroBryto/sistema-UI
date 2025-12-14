import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SummaryService } from '../../services/summary.service';
import { CarteiraFinanceiraDTO, ResumoFinanceiroDTO } from '../../models/summary.models';
import { AuthService } from '../../services/auth.service';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AiAssistantService } from '../../services/ai-assistant.service';
import { SettingsMenuComponent } from '../settings/settings-menu.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, SettingsMenuComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  loading = false;
  error: string | null = null;
  carteira: CarteiraFinanceiraDTO | null = null;
  resumo: ResumoFinanceiroDTO | null = null;
  grafico: { receitas: number; despesas: number } | null = null;
  ads: string[] = [
    '/assets/ads/ad1.svg',
    '/assets/ads/ad2.svg',
    '/assets/ads/ad3.svg',
    '/assets/ads/ad4.svg',
  ];
  currentAd = 0;
  adTimer: any;
  adIntervalMs = 2000;

  constructor(
    private summary: SummaryService,
    private auth: AuthService,
    private router: Router,
    private ai: AiAssistantService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.startAdTimer();
  }

  ngOnDestroy(): void {
    this.stopAdTimer();
  }

  onAdError(): void {
    this.currentAd = (this.currentAd + 1) % this.ads.length;
  }

  startAdTimer(): void {
    this.stopAdTimer();
    this.adTimer = setInterval(() => this.nextAd(), this.adIntervalMs);
  }

  stopAdTimer(): void {
    if (this.adTimer) {
      clearInterval(this.adTimer);
      this.adTimer = null;
    }
  }

  nextAd(): void {
    if (!this.ads.length) return;
    this.currentAd = (this.currentAd + 1) % this.ads.length;
  }

  prevAd(): void {
    if (!this.ads.length) return;
    this.currentAd = (this.currentAd - 1 + this.ads.length) % this.ads.length;
  }

  get username(): string | null {
    return this.auth.getUsername();
  }

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;
    this.carteira = null;
    this.resumo = null;
    this.grafico = null;

    this.summary.getCarteira().subscribe({
      next: (data) => {
        this.carteira = data;
        this.parseGrafico();
        this.summary.getResumo().subscribe({
          next: (res) => {
            this.resumo = res;
            this.loading = false;
          },
          error: (e) => {
            this.loading = false;
            this.error = this.errorMsg(e);
          },
        });
      },
      error: (e) => {
        this.loading = false;
        this.error = this.errorMsg(e);
      },
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }

  parseGrafico(): void {
    if (!this.carteira || !this.carteira.graficoReceitasVsDespesasJson) {
      this.grafico = null;
      return;
    }
    try {
      const obj = JSON.parse(this.carteira.graficoReceitasVsDespesasJson || '{}');
      const receitas = Number(obj?.receitas ?? obj?.totalReceitas ?? 0);
      const despesas = Number(obj?.despesas ?? obj?.totalDespesas ?? 0);
      this.grafico = {
        receitas: isNaN(receitas) ? 0 : receitas,
        despesas: isNaN(despesas) ? 0 : despesas,
      };
    } catch {
      this.grafico = null;
    }
  }

  barHeight(kind: 'receitas' | 'despesas'): number {
    if (!this.grafico) return 0;
    const max = Math.max(this.grafico.receitas, this.grafico.despesas, 1);
    const val = kind === 'receitas' ? this.grafico.receitas : this.grafico.despesas;
    const pct = (val / max) * 100;
    return Math.max(5, Math.min(100, pct));
  }

  estadoClass(saude?: 'OK' | 'ATENCAO' | 'CRITICA'): string {
    if (!saude) return 'state';
    if (saude === 'OK') return 'state ok';
    if (saude === 'ATENCAO') return 'state warn';
    return 'state crit';
  }

  barWidth(value: number, total?: number | null): number {
    if (!total || total <= 0) return 0;
    const pct = (value / total) * 100;
    return Math.max(2, Math.min(100, pct));
  }

  errorMsg(e: any): string {
    if (e?.status === 401) return 'Sessão expirada. Faça login novamente.';
    if (e?.status === 404) return 'Dados não encontrados.';
    if (e?.status === 500) return 'Erro no servidor. Tente mais tarde.';
    return e?.error?.message || 'Falha ao carregar dados do Dashboard.';
  }

  // Assistente IA
  aiOpen = true;
  aiLoading = false;
  aiError: string | null = null;
  aiResponse: string | null = null;
  aiForm = this.fb.nonNullable.group({
    message: ['', [Validators.required, Validators.minLength(2)]],
  });

  aiAsk(): void {
    if (this.aiForm.invalid) return;
    const { message } = this.aiForm.getRawValue();
    this.aiLoading = true;
    this.aiError = null;
    this.aiResponse = null;
    this.ai.ask({ message }).subscribe({
      next: (res) => {
        this.aiLoading = false;
        this.aiResponse = res.response;
      },
      error: (e) => {
        this.aiLoading = false;
        if (e?.status === 401) {
          this.auth.logout();
          this.router.navigateByUrl('/');
          return;
        }
        this.aiError = 'Não foi possível obter a resposta. Tente novamente mais tarde.';
      },
    });
  }

  aiToggle(): void { this.aiOpen = !this.aiOpen; }
}
