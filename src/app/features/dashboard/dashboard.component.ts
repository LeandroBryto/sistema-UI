import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SidebarModule } from 'primeng/sidebar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CarteiraService } from '../../services/carteira.service';
import { ReceitaService } from '../../services/receita.service';
import { DespesaService } from '../../services/despesa.service';
import { SummaryService } from '../../services/summary.service';
import { firstValueFrom } from 'rxjs';
import { ResumoFinanceiroDTO, CarteiraFinanceiraDTO } from '../../models/summary.models';
import { ReceitaResponse } from '../../models/receita.models';
import { DespesaResponse } from '../../models/despesa.models';
import { CarteiraResponse } from '../../models/carteira.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ChartModule,
    TableModule,
    ButtonModule,
    DialogModule,
    SidebarModule,
    DropdownModule,
    InputTextModule,
    AvatarModule,
    ReactiveFormsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Data
  kpis = {
    receitas: { value: 0, trend: 0 },
    despesas: { value: 0, trend: 0 },
    saldo: { value: 0, trend: 0 },
    investimentos: { value: 0, trend: 0 }
  };
  
  carteira = {
    saldo: 0,
    meta: 50000
  };

  recentTransactions: any[] = [];
  
  // Charts
  revenueChart: any;
  expenseChart: any;
  chartOptions: any;

  // Summary Sidebar
  summaryVisible: boolean = false;

  constructor(
    private carteiraService: CarteiraService,
    private receitaService: ReceitaService,
    private despesaService: DespesaService,
    private summaryService: SummaryService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initChartOptions();
    this.loadData();
  }

  initChartOptions() {
    const textColor = '#e2e8f0';
    const textColorSecondary = '#94a3b8';
    const surfaceBorder = 'rgba(255, 255, 255, 0.1)';

    this.chartOptions = {
      plugins: {
        legend: {
          labels: { color: textColor }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder, drawBorder: false }
        },
        x: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder, drawBorder: false }
        }
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      maintainAspectRatio: false
    };
  }

  loadData() {
    // Dates for filtering (current month/year)
    const now = new Date();
    const startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]; // Start of year
    const endDate = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0]; // End of year

    // Load Summary
    this.summaryService.getResumo().subscribe((data: ResumoFinanceiroDTO) => {
      this.kpis.receitas.value = data.totalReceitas;
      this.kpis.despesas.value = data.totalDespesas;
      this.kpis.saldo.value = data.saldoAtual;
    });

    // Load Investments from CarteiraService
    this.carteiraService.list().subscribe((carteiras: CarteiraResponse[]) => {
      const investimentos = carteiras.filter(c => c.tipo === 'INVESTIMENTO');
      this.kpis.investimentos.value = investimentos.reduce((acc, curr) => acc + curr.saldoAtual, 0);
    });

    // Load Carteira Summary
    this.summaryService.getCarteira().subscribe((data: CarteiraFinanceiraDTO) => {
      this.carteira.saldo = data.saldoAtual;
    });

    // Load Transactions (Mock combination of recent items)
    Promise.all([
      firstValueFrom(this.receitaService.list(startDate, endDate)),
      firstValueFrom(this.despesaService.list(startDate, endDate))
    ]).then(([receitas, despesas]) => {
      const combined = [
        ...receitas.map((r: ReceitaResponse) => ({ ...r, type: 'income', icon: 'pi pi-arrow-up' })),
        ...despesas.map((d: DespesaResponse) => ({ ...d, type: 'expense', icon: 'pi pi-arrow-down' }))
      ];
      // Sort by date desc
      this.recentTransactions = combined
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
        .slice(0, 5);

      this.updateCharts(receitas, despesas);
    });
  }

  updateCharts(receitas: ReceitaResponse[], despesas: DespesaResponse[]) {
    this.revenueChart = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Receitas',
          data: [65, 59, 80, 81, 56, 55], // Mock data for trend
          borderColor: '#34d399', // Green
          backgroundColor: 'rgba(52, 211, 153, 0.2)',
          tension: 0.4,
          fill: true
        }
      ]
    };

    this.expenseChart = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Despesas',
          data: [28, 48, 40, 19, 86, 27], // Mock data
          borderColor: '#f87171', // Red
          backgroundColor: 'rgba(248, 113, 113, 0.2)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  }
}
