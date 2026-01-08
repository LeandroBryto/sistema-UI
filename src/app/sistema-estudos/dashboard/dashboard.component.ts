import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { Router } from '@angular/router';
import { EstudosService } from '../../services/estudos.service';
import { DadosGamificacaoEntity, ItemAgendaEntity, DashboardResponse } from '../../models/estudos.models';

@Component({
  selector: 'app-sistema-estudos-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, ProgressBarModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  gamificacao: DadosGamificacaoEntity = {
    nivelAtual: 1,
    xpTotal: 0,
    moedasNexus: 0,
    ofensivaAtual: 0
  };

  agendaHoje: ItemAgendaEntity[] = [];
  progressoSemanal = {
    diasEstudados: 0,
    minutosTotais: 0,
    flashcardsRevisados: 0
  };

  loading = true;

  constructor(
    private estudosService: EstudosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarDashboard();
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
        // Dados mock para desenvolvimento
        this.gamificacao = {
          nivelAtual: 5,
          xpTotal: 1250,
          moedasNexus: 340,
          ofensivaAtual: 7
        };
        this.agendaHoje = [
          {
            id: 1,
            materiaId: 1,
            diaSemana: 'SEGUNDA' as any,
            horarioInicio: '14:00',
            horarioFim: '15:30',
            titulo: 'Revisão de Matemática'
          }
        ];
        this.progressoSemanal = {
          diasEstudados: 5,
          minutosTotais: 420,
          flashcardsRevisados: 45
        };
        this.loading = false;
      }
    });
  }

  get progressoNivel(): number {
    // Assumindo que cada nível precisa de 500 XP
    const xpParaProximoNivel = this.gamificacao.nivelAtual * 500;
    return (this.gamificacao.xpTotal % 500) / 500 * 100;
  }

  get xpParaProximoNivel(): number {
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
