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
    receitas: { value: 0, trend: 0, trendLabel: 'vs mês anterior' },
    despesas: { value: 0, trend: 0, trendLabel: 'vs mês anterior' },
    saldo: { value: 0, trend: 0, trendLabel: 'vs mês anterior' },
    investimentos: { value: 0, trend: 0, trendLabel: 'rendimento' }
  };
  
  carteira = {
    saldo: 0,
    meta: 0
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
    this.loadTrends();
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

    // Load Summary (Now calculated manually from transactions to ensure consistency)
    // this.summaryService.getResumo().subscribe(...) - REMOVED to fix logic

    // Load Investments from CarteiraService
    this.carteiraService.list().subscribe((carteiras: CarteiraResponse[]) => {
      const investimentos = carteiras.filter(c => c.tipo === 'INVESTIMENTO');
      this.kpis.investimentos.value = investimentos.reduce((acc, curr) => acc + curr.saldoAtual, 0);
    });

    // Load Carteira Summary
    this.summaryService.getCarteira().subscribe((data: CarteiraFinanceiraDTO) => {
      this.carteira.saldo = data.saldoAtual;
    });

    // Load Transactions (Fetch full year to calculate current month KPIs locally)
    Promise.all([
      firstValueFrom(this.receitaService.list(startDate, endDate)),
      firstValueFrom(this.despesaService.list(startDate, endDate))
    ]).then(([receitas, despesas]) => {
      
      // Calculate KPIs manually for the current month
      const now = new Date();
      const currentMonth = now.getMonth(); // 0-11
      const currentYear = now.getFullYear();

      const isCurrentMonth = (dateStr: string) => {
        if (!dateStr) return false;
        const [y, m, d] = dateStr.split('-').map(Number);
        return y === currentYear && (m - 1) === currentMonth;
      };

      const receitasMes = receitas.filter(r => isCurrentMonth(r.data));
      const despesasMes = despesas.filter(d => isCurrentMonth(d.data));

      const totalReceitas = receitasMes.reduce((acc, r) => acc + r.valor, 0);
      const totalDespesas = despesasMes.reduce((acc, d) => acc + d.valor, 0);

      this.kpis.receitas.value = totalReceitas;
      this.kpis.despesas.value = totalDespesas; // Display as positive here, negative in template

      // Saldo logic: Receitas - Despesas, if negative show 0
      const saldoCalculado = totalReceitas - totalDespesas;
      this.kpis.saldo.value = Math.max(0, saldoCalculado);

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

  loadTrends() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    // Calculate previous month
    let prevMonth = currentMonth - 1;
    let prevYear = currentYear;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = currentYear - 1;
    }

    const currentKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    const prevKey = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;

    // Get Current Month Data (for comparison base)
    this.summaryService.getRelatorioMensal(currentKey).subscribe(current => {
      this.summaryService.getRelatorioMensal(prevKey).subscribe(prev => {
        this.calculateTrend(this.kpis.receitas, current.totalReceitas, prev.totalReceitas);
        this.calculateTrend(this.kpis.despesas, current.totalDespesas, prev.totalDespesas);
        // Saldo trend usually doesn't make sense as % change if crossing zero, but let's try difference
        this.calculateTrend(this.kpis.saldo, current.saldo, prev.saldo);
      }, err => {
        // If no previous data, assume 0 trend
        this.kpis.receitas.trend = 0;
        this.kpis.despesas.trend = 0;
        this.kpis.saldo.trend = 0;
      });
    });
  }

  private calculateTrend(kpi: any, current: number, previous: number) {
    if (previous === 0) {
      kpi.trend = current > 0 ? 100 : 0;
    } else {
      kpi.trend = ((current - previous) / Math.abs(previous)) * 100;
    }
  }

  updateCharts(receitas: ReceitaResponse[], despesas: DespesaResponse[]) {
    // Inicializar arrays para os 12 meses
    const receitaData = new Array(12).fill(0);
    const despesaData = new Array(12).fill(0);

    // Processar Receitas
    receitas.forEach(r => {
      // Data vem como YYYY-MM-DD. Split evita problemas de timezone.
      if (r.data) {
        const parts = r.data.split('-');
        if (parts.length === 3) {
          const monthIndex = parseInt(parts[1], 10) - 1; // 0-11
          if (monthIndex >= 0 && monthIndex < 12) {
            receitaData[monthIndex] += r.valor;
          }
        }
      }
    });

    // Processar Despesas
    despesas.forEach(d => {
      if (d.data) {
        const parts = d.data.split('-');
        if (parts.length === 3) {
          const monthIndex = parseInt(parts[1], 10) - 1; // 0-11
          if (monthIndex >= 0 && monthIndex < 12) {
            despesaData[monthIndex] += d.valor;
          }
        }
      }
    });

    const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    this.revenueChart = {
      labels: labels,
      datasets: [
        {
          label: 'Receitas',
          data: receitaData,
          borderColor: '#34d399', // Green
          backgroundColor: 'rgba(52, 211, 153, 0.2)',
          tension: 0.4,
          fill: true
        }
      ]
    };

    this.expenseChart = {
      labels: labels,
      datasets: [
        {
          label: 'Despesas',
          data: despesaData,
          borderColor: '#f87171', // Red
          backgroundColor: 'rgba(248, 113, 113, 0.2)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  }
}
