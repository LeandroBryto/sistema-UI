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
import { TooltipModule } from 'primeng/tooltip';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { CarteiraService } from '../../services/carteira.service';
import { ReceitaService } from '../../services/receita.service';
import { DespesaService } from '../../services/despesa.service';
import { SummaryService } from '../../services/summary.service';
import { firstValueFrom } from 'rxjs';
import { ResumoFinanceiroDTO, CarteiraFinanceiraDTO } from '../../models/summary.models';
import { ReceitaResponse } from '../../models/receita.models';
import { DespesaResponse } from '../../models/despesa.models';
import { CarteiraResponse } from '../../models/carteira.models';

import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AiAssistantService } from '../../services/ai-assistant.service';
import { ThemeService } from '../../services/theme.service';
import { AiAssistantRequestDTO } from '../../models/ai.models';

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
    TooltipModule,
    ReactiveFormsModule,
    FormsModule
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

  // AI Assistant
  aiVisible = false;
  aiQuery = '';
  aiLoading = false;
  aiChatHistory: { role: 'user' | 'assistant', content: string }[] = [
    { role: 'assistant', content: 'Olá! Sou seu assistente financeiro. Como posso ajudar você hoje com suas finanças?' }
  ];

  // Summary Sidebar
  summaryVisible: boolean = false;

  constructor(
    private carteiraService: CarteiraService,
    private receitaService: ReceitaService,
    private despesaService: DespesaService,
    private summaryService: SummaryService,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private aiService: AiAssistantService
  ) {}

  ngOnInit(): void {
    this.initChartOptions();
    this.loadData();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // AI Methods
  openAiAssistant() {
    this.aiVisible = true;
  }

  sendAiQuery() {
    if (!this.aiQuery.trim()) return;

    const userMsg = this.aiQuery;
    this.aiChatHistory.push({ role: 'user', content: userMsg });
    this.aiQuery = '';
    this.aiLoading = true;

    const request: AiAssistantRequestDTO = {
      message: userMsg,
      context: {
        saldoAtual: this.kpis.saldo.value,
        receitas: this.kpis.receitas.value,
        despesas: this.kpis.despesas.value
      }
    };

    this.aiService.ask(request).subscribe({
      next: (res) => {
        this.aiChatHistory.push({ role: 'assistant', content: res.response });
        this.aiLoading = false;
      },
      error: (err) => {
        console.error('AI Error', err);
        this.aiChatHistory.push({ role: 'assistant', content: 'Desculpe, tive um problema ao processar sua solicitação. Tente novamente.' });
        this.aiLoading = false;
      }
    });
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
