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
import { Router, ActivatedRoute } from '@angular/router';

import { ModoFocoService } from '../../services/modo-foco.service';
import { EstudosService } from '../../services/estudos.service';
import { MateriaResponseDTO } from '../../models/estudos.models';
import { SessaoRequestDTO, SessaoResponseDTO, FinalizarEstudoRequestDTO } from '../../models/modo-foco.models';

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
  tempoDecorrido = 0; // Tempo decorrido em segundos
  isRunning = false;
  isPaused = false;
  interval: any;
  dataInicio: Date | null = null;

  // Ganho progressivo
  minutosEstudados = 0;
  xpGanhoTemporario = 0;
  moedasGanhasTemporarias = 0;
  ultimoMinutoProcessado = 0;

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
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.carregarMaterias();
    this.carregarHistorico();
    this.carregarEstadoTimer();

    // Processar query params da agenda
    this.route.queryParams.subscribe(params => {
      if (params['materiaId']) {
        const materiaId = +params['materiaId'];
        // Aguardar carregamento das matérias antes de pré-carregar
        setTimeout(() => this.preCarregarMateria(materiaId), 100);
      }
      if (params['anotacao']) {
        this.anotacoes = params['anotacao'];
      }
    });
  }

  ngOnDestroy(): void {
    this.salvarEstadoTimer();
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

    this.salvarEstadoTimer();

    this.interval = setInterval(() => {
      this.tempoDecorrido++;

      // Processar ganho progressivo a cada minuto
      const minutosAtuais = Math.floor(this.tempoDecorrido / 60);
      if (minutosAtuais > this.ultimoMinutoProcessado) {
        this.processarGanhoProgressivo(minutosAtuais - this.ultimoMinutoProcessado);
        this.ultimoMinutoProcessado = minutosAtuais;
      }
    }, 1000);
  }

  pausarTimer(): void {
    this.isPaused = true;
    this.isRunning = false;
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.salvarEstadoTimer();
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

    const finalizarRequest: FinalizarEstudoRequestDTO = {
      materiaId: this.materiaSelecionada.id,
      dataInicio: this.dataInicio.toISOString(),
      dataFim: dataFim.toISOString(),
      anotacoes: this.anotacoes || undefined
    };

    this.modoFocoService.finalizarEstudo(finalizarRequest).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sessão Finalizada!',
          detail: `Você estudou por ${minutosTotais} minutos.`
        });

        // Resetar timer
        this.reiniciarTimer();
        localStorage.removeItem('modoFocoEstado');
        this.materiaSelecionada = null;
        this.anotacoes = '';
        this.dataInicio = null;
      },
      error: (error) => {
        console.error('Erro ao finalizar estudo:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível finalizar a sessão.'
        });
      }
    });
  }

  reiniciarTimer(): void {
    this.tempoDecorrido = 0;
    this.isRunning = false;
    this.isPaused = false;
    this.dataInicio = null;
    this.anotacoes = '';
    this.minutosEstudados = 0;
    this.xpGanhoTemporario = 0;
    this.moedasGanhasTemporarias = 0;
    this.ultimoMinutoProcessado = 0;
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
    return 0; // Tempo livre, sem progresso definido
  }

  preCarregarMateria(materiaId: number): void {
    // Aguardar carregamento das matérias e selecionar a específica
    if (this.materias.length > 0) {
      const materia = this.materias.find(m => m.id === materiaId);
      if (materia) {
        this.materiaSelecionada = materia;
      }
    }
  }

  processarGanhoProgressivo(minutosNovos: number): void {
    // Calcular ganho progressivo: 1 XP e 1 moeda por minuto
    this.xpGanhoTemporario += minutosNovos * 1;
    this.moedasGanhasTemporarias += minutosNovos * 1;
    this.minutosEstudados += minutosNovos;
  }

  salvarAnotacoes(): void {
    if (!this.anotacoes.trim()) return;

    this.messageService.add({
      severity: 'success',
      summary: 'Anotações Salvas',
      detail: 'Suas anotações foram salvas localmente.'
    });
  }

  toggleHistorico(): void {
    this.mostrarHistorico = !this.mostrarHistorico;
  }

  cancelarSessao(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.isRunning = false;
    this.isPaused = false;

    this.messageService.add({
      severity: 'info',
      summary: 'Sessão Cancelada',
      detail: 'A sessão foi cancelada. Nenhum progresso foi salvo.'
    });

    // Resetar tudo
    this.reiniciarTimer();
    this.materiaSelecionada = null;
    this.anotacoes = '';
    this.dataInicio = null;
  }

  private salvarEstadoTimer(): void {
    const estado = {
      tempoDecorrido: this.tempoDecorrido,
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      dataInicio: this.dataInicio ? this.dataInicio.toISOString() : null,
      materiaSelecionada: this.materiaSelecionada,
      anotacoes: this.anotacoes,
      minutosEstudados: this.minutosEstudados,
      xpGanhoTemporario: this.xpGanhoTemporario,
      moedasGanhasTemporarias: this.moedasGanhasTemporarias,
      ultimoMinutoProcessado: this.ultimoMinutoProcessado
    };
    localStorage.setItem('modoFocoEstado', JSON.stringify(estado));
  }

  private carregarEstadoTimer(): void {
    const estadoStr = localStorage.getItem('modoFocoEstado');
    if (estadoStr) {
      try {
        const estado = JSON.parse(estadoStr);
        this.tempoDecorrido = estado.tempoDecorrido || 0;
        this.isRunning = estado.isRunning || false;
        this.isPaused = estado.isPaused || false;
        this.dataInicio = estado.dataInicio ? new Date(estado.dataInicio) : null;
        this.materiaSelecionada = estado.materiaSelecionada;
        this.anotacoes = estado.anotacoes || '';
        this.minutosEstudados = estado.minutosEstudados || 0;
        this.xpGanhoTemporario = estado.xpGanhoTemporario || 0;
        this.moedasGanhasTemporarias = estado.moedasGanhasTemporarias || 0;
        this.ultimoMinutoProcessado = estado.ultimoMinutoProcessado || 0;

        // Se estava rodando, reiniciar o interval
        if (this.isRunning && !this.isPaused) {
          this.interval = setInterval(() => {
            this.tempoDecorrido++;
            const minutosAtuais = Math.floor(this.tempoDecorrido / 60);
            if (minutosAtuais > this.ultimoMinutoProcessado) {
              this.processarGanhoProgressivo(minutosAtuais - this.ultimoMinutoProcessado);
              this.ultimoMinutoProcessado = minutosAtuais;
            }
          }, 1000);
        }
      } catch (e) {
        console.error('Erro ao carregar estado do timer:', e);
        localStorage.removeItem('modoFocoEstado');
      }
    }
  }
}