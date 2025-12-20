import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TaxasService, TaxasDTO } from '../../services/taxas.service';
import { CotacaoService } from '../../services/cotacao.service';
import { CotacaoAtualResponse, CotacaoDia } from '../../models/cotacao.models';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-investimentos',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, CardModule, ChartModule],
  templateUrl: './investimentos.component.html',
  styleUrls: ['./investimentos.component.css']
})
export class InvestimentosComponent implements OnInit {
  taxas: TaxasDTO | null = null;
  taxasLoading = false;
  
  cotacaoAtual: CotacaoAtualResponse | null = null;
  chartData: any;
  chartOptions: any;

  constructor(
    private taxasService: TaxasService,
    private cotacaoService: CotacaoService
  ) {}

  ngOnInit(): void {
    this.loadTaxas();
    this.loadCotacao();
    this.initChartOptions();
  }

  loadTaxas(): void {
    this.taxasLoading = true;
    this.taxasService.getTaxas().subscribe((t: TaxasDTO) => {
      this.taxas = t;
      this.taxasLoading = false;
    });
  }

  loadCotacao(): void {
    // Carrega cotação atual
    this.cotacaoService.getAtual().subscribe({
      next: (res) => {
        this.cotacaoAtual = res;
      },
      error: (err) => console.error('Erro ao carregar cotação atual', err)
    });

    // Carrega histórico para o gráfico (últimos 30 dias por padrão)
    this.cotacaoService.getHistorico().subscribe({
      next: (historico) => {
        this.updateChart(historico);
      },
      error: (err) => console.error('Erro ao carregar histórico', err)
    });
  }

  updateChart(historico: CotacaoDia[]): void {
    // Ordena por data (caso não venha ordenado)
    historico.sort((a, b) => new Date(a.dataCotacao).getTime() - new Date(b.dataCotacao).getTime());

    const labels = historico.map(h => {
      const parts = h.dataCotacao.split('-'); // YYYY-MM-DD
      return `${parts[2]}/${parts[1]}`; // DD/MM
    });
    
    const values = historico.map(h => h.valor);

    this.chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Cotação do Dólar (R$)',
          data: values,
          fill: true,
          borderColor: '#1e50ff',
          backgroundColor: 'rgba(30, 80, 255, 0.1)',
          tension: 0.4
        }
      ]
    };
  }

  initChartOptions(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color') || '#495057';
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#6c757d';
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#dfe7ef';

    this.chartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };
  }
}
