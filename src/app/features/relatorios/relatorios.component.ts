import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { SummaryService } from '../../services/summary.service';
import { RelatorioMensalDTO } from '../../models/summary.models';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, ButtonModule, ChartModule],
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

  // Chart Data
  mixedChartData: any;
  
  doughnutOptions: any;

  constructor(private fb: FormBuilder, private summary: SummaryService) {
    this.initChartOptions();
    this.load();
  }

  currentMonth(): string {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${m}`;
  }

  initChartOptions(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color') || '#495057';
    
    this.doughnutOptions = {
      cutout: '60%',
      plugins: {
        legend: {
          labels: { color: textColor }
        }
      }
    };
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
        this.updateCharts(data);
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

  updateCharts(data: RelatorioMensalDTO): void {
    // Paletas de cores específicas
    // Receitas: Tons de Verde e Azul-Esverdeado (Teal)
    const receitaColors = [
      '#22c55e', // green-500
      '#16a34a', // green-600
      '#10b981', // emerald-500
      '#34d399', // emerald-400
      '#84cc16', // lime-500
      '#15803d', // green-700
      '#059669', // emerald-600
      '#4ade80', // green-400
    ];

    // Despesas: Tons de Vermelho, Laranja e Rosa
    const despesaColors = [
      '#ef4444', // red-500
      '#dc2626', // red-600
      '#f97316', // orange-500
      '#ea580c', // orange-600
      '#ec4899', // pink-500
      '#db2777', // pink-600
      '#b91c1c', // red-700
      '#fb923c', // orange-400
    ];
    
    // 1. Doughnut Unificado (Receitas e Despesas)
    const items: { label: string; value: number; type: 'rec' | 'desp' }[] = [];

    if (data.rankingReceitasPorCategoria) {
      Object.entries(data.rankingReceitasPorCategoria).forEach(([key, val]) => {
        items.push({ label: key, value: val, type: 'rec' });
      });
    }

    if (data.rankingDespesasPorCategoria) {
      Object.entries(data.rankingDespesasPorCategoria).forEach(([key, val]) => {
        items.push({ label: key, value: val, type: 'desp' });
      });
    }

    // Ordenar por valor (maior para o menor)
    items.sort((a, b) => b.value - a.value);

    const labels = items.map(i => i.label);
    const values = items.map(i => i.value);
    
    // Gerar cores baseadas no tipo
    const bgColors = items.map((item, index) => {
      if (item.type === 'rec') {
        return receitaColors[index % receitaColors.length];
      } else {
        return despesaColors[index % despesaColors.length];
      }
    });

    this.mixedChartData = {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: bgColors,
        hoverBackgroundColor: bgColors
      }]
    };
  }

  calcWidth(value: number, total: number | undefined | null): number {
    if (!total || total <= 0) return 0;
    const pct = (value / total) * 100;
    return Math.max(2, Math.min(100, pct));
  }
}
