import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { GoalService } from '../../services/goal.service';
import { GoalRequest, GoalResponse, CotacaoDolarDTO } from '../../models/goal.models';

@Component({
  selector: 'app-metas',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './metas.component.html',
  styleUrls: ['./metas.component.css'],
})
export class MetasComponent {
  loading = false;
  error: string | null = null;
  success: string | null = null;
  itens: GoalResponse[] = [];
  cotacao: CotacaoDolarDTO | null = null;
  cotacaoMsg: string | null = null;
  cotacaoData = this.fb.nonNullable.control('');

  form = this.fb.nonNullable.group({
    meta: ['', [Validators.required]],
    valorMeta: [0, [Validators.required, Validators.min(0.01)]],
    valorAcumulado: [0],
  });

  constructor(private fb: FormBuilder, private api: GoalService) {
    this.load();
    this.loadCotacao();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.api.list().subscribe({
      next: (list) => {
        this.itens = list;
        this.loading = false;
      },
      error: (e) => {
        this.loading = false;
        this.error =
          e?.error?.message ||
          'Erro ao listar metas. Tente novamente mais tarde.';
      },
    });
  }

  loadCotacao(): void {
    this.api.cotacaoDolar().subscribe({
      next: (data) => {
        if (data) {
          this.cotacao = data;
          this.cotacaoMsg = null;
        } else {
          this.cotacao = null;
          this.cotacaoMsg = 'Cotação do dólar indisponível no momento.';
        }
      },
      error: () => {
        this.cotacao = null;
        this.cotacaoMsg = 'Cotação do dólar indisponível no momento.';
      },
    });
  }

  private toBR(d?: string): string | undefined {
    if (!d) return undefined;
    // input ISO: yyyy-MM-dd -> dd/MM/yyyy
    const [y, m, day] = d.split('-');
    if (!y || !m || !day) return undefined;
    return `${day}/${m}/${y}`;
  }

  private toBRNextDay(d?: string): string | undefined {
    if (!d) return undefined;
    const dt = new Date(d + 'T00:00:00');
    if (isNaN(dt.getTime())) return undefined;
    dt.setDate(dt.getDate() + 1);
    const day = String(dt.getDate()).padStart(2, '0');
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const year = String(dt.getFullYear());
    return `${day}/${month}/${year}`;
  }

  updateCotacao(): void {
    const di = this.toBR(this.cotacaoData.value || undefined);
    const df = this.toBRNextDay(this.cotacaoData.value || undefined);
    this.api.cotacaoDolar(di, df).subscribe({
      next: (data) => {
        if (data) {
          this.cotacao = data;
          this.cotacaoMsg = null;
        } else {
          this.cotacao = null;
          this.cotacaoMsg = 'Cotação do dólar indisponível no momento.';
        }
      },
      error: () => {
        this.cotacao = null;
        this.cotacaoMsg = 'Cotação do dólar indisponível no momento.';
      },
    });
  }

  resetForm(): void {
    this.form.reset({
      meta: '',
      valorMeta: 0,
      valorAcumulado: 0,
    });
    this.success = null;
    this.error = null;
  }

  save(): void {
    if (this.form.invalid) return;
    const payload = this.form.getRawValue() as GoalRequest;
    this.loading = true;
    this.error = null;
    this.success = null;
    this.api.create(payload).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Meta criada com sucesso.';
        this.resetForm();
        this.load();
      },
      error: (e) => {
        this.loading = false;
        this.error =
          e?.error?.message ||
          'Falha ao criar a meta. Verifique os campos e tente novamente.';
      },
    });
  }

  pct(v: number, total: number): number {
    if (!total || total <= 0) return 0;
    const p = (v / total) * 100;
    return Math.max(0, Math.min(100, p));
  }
}
