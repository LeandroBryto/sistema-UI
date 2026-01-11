import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { Router } from '@angular/router';
import { EstudosService } from '../../services/estudos.service';
import { ModoFocoService } from '../../services/modo-foco.service';
import { DadosGamificacaoEntity, ItemAgendaEntity, DashboardResponse } from '../../models/estudos.models';
import { SessaoResponseDTO } from '../../models/modo-foco.models';

@Component({
  selector: 'app-sistema-estudos-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, ProgressBarModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  gamificacao: DadosGamificacaoEntity | null = null;

  agendaHoje: ItemAgendaEntity[] = [];
  progressoSemanal: any = null;
  historicoSessoes: SessaoResponseDTO[] = [];

  loading = true;

  constructor(
    private estudosService: EstudosService,
    private modoFocoService: ModoFocoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarDashboard();
    this.carregarHistorico();
  }

  carregarDashboard(): void {
    this.loading = true;
    this.estudosService.getDashboard().subscribe({
      next: (response: DashboardResponse) => {
        this.gamificacao = response.gamificacao;
        this.agendaHoje = response.agendaHoje;
        this.progressoSemanal = response.progressoSemanal;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar dashboard:', error);
        this.loading = false;
      }
    });
  }

  carregarHistorico(): void {
    this.modoFocoService.listarHistorico().subscribe({
      next: (historico) => {
        this.historicoSessoes = historico;
      },
      error: (error) => {
        console.error('Erro ao carregar histórico:', error);
      }
    });
  }

  get progressoNivel(): number {
    if (!this.gamificacao) return 0;
    // Assumindo que cada nível precisa de 500 XP
    const xpParaProximoNivel = this.gamificacao.nivelAtual * 500;
    return (this.gamificacao.xpTotal % 500) / 500 * 100;
  }

  get xpParaProximoNivel(): number {
    if (!this.gamificacao) return 0;
    return this.gamificacao.nivelAtual * 500;
  }

  iniciarSessao(itemAgenda: ItemAgendaEntity): void {
    // Navega para o modo foco com a matéria selecionada
    this.router.navigate(['/estudos/modo-foco'], {
      queryParams: { materiaId: itemAgenda.materiaId }
    });
  }

  navegarParaMaterias(): void {
    this.router.navigate(['/estudos/materias']);
  }

  navegarParaModoFoco(): void {
    this.router.navigate(['/estudos/modo-foco']);
  }

  navegarParaFlashcards(): void {
    this.router.navigate(['/estudos/flashcards']);
  }

  navegarParaAgenda(): void {
    this.router.navigate(['/estudos/agenda']);
  }
}
