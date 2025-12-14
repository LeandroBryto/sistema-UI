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
  cotacaoLoading = false;

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
    this.cotacaoLoading = true;
    this.api.cotacaoDolar().subscribe({
      next: (data) => {
        if (data) {
          this.cotacao = data;
          this.cotacaoMsg = null;
        } else {
          this.cotacao = null;
          this.cotacaoMsg = 'Cotação do dólar indisponível no momento.';
        }
        this.cotacaoLoading = false;
      },
      error: () => {
        this.cotacao = null;
        this.cotacaoMsg = 'Cotação do dólar indisponível no momento.';
        this.cotacaoLoading = false;
      },
    });
  }

  updateCotacao(): void {
    this.cotacaoLoading = true;
    this.api.cotacaoDolar().subscribe({
      next: (data) => {
        if (data) {
          this.cotacao = data;
          this.cotacaoMsg = null;
        } else {
          this.cotacao = null;
          this.cotacaoMsg = 'Cotação do dólar indisponível no momento.';
        }
        this.cotacaoLoading = false;
      },
      error: () => {
        this.cotacao = null;
        this.cotacaoMsg = 'Cotação do dólar indisponível no momento.';
        this.cotacaoLoading = false;
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
