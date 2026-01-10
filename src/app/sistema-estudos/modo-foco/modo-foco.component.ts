import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { ModoFocoService } from '../../services/modo-foco.service';
import { EstudosService } from '../../services/estudos.service';
import { MateriaResponseDTO } from '../../models/estudos.models';
import { SessaoRequestDTO, SessaoResponseDTO } from '../../models/modo-foco.models';

@Component({
  selector: 'app-sistema-estudos-modo-foco',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    InputTextareaModule,
    DropdownModule,
    ProgressBarModule,
    DialogModule,
    FormsModule,
    ToastModule
  ],
  templateUrl: './modo-foco.component.html',
  styleUrls: ['./modo-foco.component.css'],
  providers: [MessageService]
})
export class ModoFocoComponent implements OnInit, OnDestroy {

  // Timer
  tempoRestante = 25 * 60; // 25 minutos em segundos
  tempoTotal = 25 * 60; // Para calcular progresso
  isRunning = false;
  isPaused = false;
  interval: any;
  dataInicio: Date | null = null;

  // Dados
  materias: MateriaResponseDTO[] = [];
  materiaSelecionada: MateriaResponseDTO | null = null;
  anotacoes = '';

  // Sessão atual
  sessaoAtual: SessaoResponseDTO | null = null;
  historicoSessoes: SessaoResponseDTO[] = [];

  // UI
  loading = false;
  mostrarHistorico = false;

  constructor(
    private modoFocoService: ModoFocoService,
    private estudosService: EstudosService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.carregarMaterias();
    this.carregarHistorico();
  }

  ngOnDestroy(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  carregarMaterias(): void {
    this.loading = true;
    this.estudosService.getMaterias().subscribe({
      next: (materias) => {
        this.materias = materias;
        if (materias.length > 0 && !this.materiaSelecionada) {
          this.materiaSelecionada = materias[0];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar matérias:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar as matérias.'
        });
        this.loading = false;
      }
    });
  }

  carregarHistorico(): void {
    this.modoFocoService.listarHistorico().subscribe({
      next: (sessoes) => {
        this.historicoSessoes = sessoes;
      },
      error: (error) => {
        console.error('Erro ao carregar histórico:', error);
      }
    });
  }

  iniciarTimer(): void {
    if (!this.materiaSelecionada) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Selecione uma matéria antes de iniciar a sessão.'
      });
      return;
    }

    this.isRunning = true;
    this.isPaused = false;
    this.dataInicio = new Date();

    this.interval = setInterval(() => {
      if (this.tempoRestante > 0) {
        this.tempoRestante--;
      } else {
        this.finalizarSessao();
      }
    }, 1000);
  }

  pausarTimer(): void {
    this.isPaused = true;
    this.isRunning = false;
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  retomarTimer(): void {
    this.iniciarTimer();
  }

  finalizarSessao(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.isRunning = false;
    this.isPaused = false;

    // Registrar sessão no backend
    this.registrarSessao();
  }

  registrarSessao(): void {
    if (!this.materiaSelecionada || !this.dataInicio) return;

    const dataFim = new Date();
    const minutosTotais = Math.floor((dataFim.getTime() - this.dataInicio.getTime()) / (1000 * 60));

    const sessaoRequest: SessaoRequestDTO = {
      materiaId: this.materiaSelecionada.id,
      dataInicio: this.dataInicio,
      dataFim: dataFim,
      anotacoes: this.anotacoes || undefined
    };

    this.modoFocoService.registrarSessao(sessaoRequest).subscribe({
      next: (sessao) => {
        this.sessaoAtual = sessao;
        this.carregarHistorico(); // Recarregar histórico

        this.messageService.add({
          severity: 'success',
          summary: 'Sessão Finalizada!',
          detail: `Você ganhou ${sessao.xpGanho} XP estudando por ${minutosTotais} minutos.`
        });

        // Resetar timer
        this.reiniciarTimer();
      },
      error: (error) => {
        console.error('Erro ao registrar sessão:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível registrar a sessão.'
        });
      }
    });
  }

  reiniciarTimer(): void {
    this.tempoRestante = 25 * 60;
    this.tempoTotal = 25 * 60;
    this.isRunning = false;
    this.isPaused = false;
    this.dataInicio = null;
    this.anotacoes = '';
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  formatarTempo(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`;
  }

  getProgresso(): number {
    if (this.tempoTotal === 0) return 0;
    return ((this.tempoTotal - this.tempoRestante) / this.tempoTotal) * 100;
  }

  getXpEstimado(): number {
    if (!this.dataInicio || !this.isRunning) return 0;
    const minutosAtuais = Math.floor((new Date().getTime() - this.dataInicio.getTime()) / (1000 * 60));
    return minutosAtuais * 10; // 10 XP por minuto
  }

  getMinutosEstudados(): number {
    return Math.floor((25 * 60 - this.tempoRestante) / 60);
  }

  toggleHistorico(): void {
    this.mostrarHistorico = !this.mostrarHistorico;
  }
}