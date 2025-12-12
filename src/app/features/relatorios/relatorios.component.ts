import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SummaryService, RelatorioMensalDTO } from '../../services/summary.service';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './relatorios.component.html',
  styleUrls: ['./relatorios.component.css'],
})
export class RelatoriosComponent {
  loading = false;
  error: string | null = null;
  report: RelatorioMensalDTO | null = null;

  filtro = this.fb.nonNullable.group({
    yearMonth: [this.currentMonth(), [Validators.required]],
  });

  constructor(private fb: FormBuilder, private summary: SummaryService) {
    this.load();
  }

  currentMonth(): string {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${m}`;
  }

  load(): void {
    if (this.filtro.invalid) return;
    this.loading = true;
    this.error = null;
    this.report = null;
    const { yearMonth } = this.filtro.getRawValue();
    this.summary.getRelatorioMensal(yearMonth).subscribe({
      next: (data) => {
        this.report = data;
        this.loading = false;
      },
      error: (e) => {
        this.loading = false;
        this.error =
          e?.error?.message ||
          'Erro ao carregar relatório. Verifique o período e tente novamente.';
      },
    });
  }

  calcWidth(value: number, total: number | undefined | null): number {
    if (!total || total <= 0) return 0;
    const pct = (value / total) * 100;
    return Math.max(2, Math.min(100, pct));
  }
}
