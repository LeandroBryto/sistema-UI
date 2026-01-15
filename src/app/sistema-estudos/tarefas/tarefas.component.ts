import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { EstudosService } from '../../services/estudos.service';
import { MateriaResponseDTO, TarefaEstudoRequestDTO, TarefaEstudoResponseDTO, TarefaPrioridade, TarefaStatus } from '../../models/estudos.models';

@Component({
  selector: 'app-sistema-estudos-tarefas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    InputTextareaModule,
    CalendarModule,
    ToastModule
  ],
  templateUrl: './tarefas.component.html',
  styleUrls: ['./tarefas.component.css'],
  providers: [MessageService]
})
export class TarefasComponent implements OnInit {
  tarefas: TarefaEstudoResponseDTO[] = [];
  materias: MateriaResponseDTO[] = [];

  loading = true;
  dialogVisivel = false;
  tarefaEditando: TarefaEstudoResponseDTO | null = null;

  formTarefa: TarefaEstudoRequestDTO = {
    materiaId: 0,
    titulo: '',
    descricao: '',
    prioridade: 'MEDIA',
    dataPrevista: undefined
  };

  dataPrevistaDate: Date | null = null;

  prioridades: { label: string; value: TarefaPrioridade }[] = [
    { label: 'Baixa', value: 'BAIXA' },
    { label: 'Média', value: 'MEDIA' },
    { label: 'Alta', value: 'ALTA' }
  ];

  constructor(
    private estudosService: EstudosService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.carregarMaterias();
    this.carregarTarefas();
  }

  get tarefasPendentes(): TarefaEstudoResponseDTO[] {
    return this.tarefas.filter(t => t.status === 'PENDENTE');
  }

  get tarefasEmAndamento(): TarefaEstudoResponseDTO[] {
    return this.tarefas.filter(t => t.status === 'EM_ANDAMENTO');
  }

  get tarefasConcluidas(): TarefaEstudoResponseDTO[] {
    return this.tarefas.filter(t => t.status === 'CONCLUIDA');
  }

  carregarMaterias(): void {
    this.estudosService.getMaterias().subscribe({
      next: materias => {
        this.materias = materias;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar as matérias.'
        });
      }
    });
  }

  carregarTarefas(): void {
    this.loading = true;
    this.estudosService.getTarefas().subscribe({
      next: tarefas => {
        this.tarefas = tarefas;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar as tarefas.'
        });
      }
    });
  }

  abrirDialogNova(): void {
    this.tarefaEditando = null;
    this.formTarefa = {
      materiaId: this.materias[0]?.id || 0,
      titulo: '',
      descricao: '',
      prioridade: 'MEDIA',
      dataPrevista: undefined
    };
    this.dataPrevistaDate = null;
    this.dialogVisivel = true;
  }

  abrirDialogEditar(tarefa: TarefaEstudoResponseDTO): void {
    this.tarefaEditando = tarefa;
    this.formTarefa = {
      materiaId: tarefa.materiaId,
      titulo: tarefa.titulo,
      descricao: tarefa.descricao,
      prioridade: tarefa.prioridade,
      dataPrevista: tarefa.dataPrevista
    };
    this.dataPrevistaDate = tarefa.dataPrevista ? new Date(tarefa.dataPrevista) : null;
    this.dialogVisivel = true;
  }

  salvarTarefa(): void {
    if (!this.formTarefa.titulo.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'O título da tarefa é obrigatório.'
      });
      return;
    }

    if (!this.formTarefa.materiaId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Selecione uma matéria.'
      });
      return;
    }

    if (this.dataPrevistaDate) {
      const ano = this.dataPrevistaDate.getFullYear();
      const mes = String(this.dataPrevistaDate.getMonth() + 1).padStart(2, '0');
      const dia = String(this.dataPrevistaDate.getDate()).padStart(2, '0');
      this.formTarefa.dataPrevista = `${ano}-${mes}-${dia}`;
    } else {
      this.formTarefa.dataPrevista = undefined;
    }

    if (this.tarefaEditando) {
      this.estudosService.atualizarTarefa(this.tarefaEditando.id, this.formTarefa).subscribe({
        next: tarefaAtualizada => {
          const index = this.tarefas.findIndex(t => t.id === tarefaAtualizada.id);
          if (index !== -1) {
            this.tarefas[index] = tarefaAtualizada;
          }
          this.dialogVisivel = false;
          this.tarefaEditando = null;
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Tarefa atualizada com sucesso.'
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao atualizar tarefa.'
          });
        }
      });
    } else {
      this.estudosService.criarTarefa(this.formTarefa).subscribe({
        next: tarefaCriada => {
          this.tarefas.push(tarefaCriada);
          this.dialogVisivel = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Tarefa criada com sucesso.'
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao criar tarefa.'
          });
        }
      });
    }
  }

  atualizarStatus(tarefa: TarefaEstudoResponseDTO, status: TarefaStatus): void {
    if (tarefa.status === status) {
      return;
    }

    this.estudosService.atualizarStatusTarefa(tarefa.id, status).subscribe({
      next: tarefaAtualizada => {
        const index = this.tarefas.findIndex(t => t.id === tarefaAtualizada.id);
        if (index !== -1) {
          this.tarefas[index] = tarefaAtualizada;
        }
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Status da tarefa atualizado.'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível atualizar o status da tarefa.'
        });
      }
    });
  }

  excluirTarefa(tarefa: TarefaEstudoResponseDTO): void {
    this.estudosService.deletarTarefa(tarefa.id).subscribe({
      next: () => {
        this.tarefas = this.tarefas.filter(t => t.id !== tarefa.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Tarefa excluída com sucesso.'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível excluir a tarefa.'
        });
      }
    });
  }

  getNomeMateria(tarefa: TarefaEstudoResponseDTO): string {
    if (tarefa.materiaNome) {
      return tarefa.materiaNome;
    }
    const materia = this.materias.find(m => m.id === tarefa.materiaId);
    return materia ? materia.nome : 'Matéria';
  }

  getCorMateria(tarefa: TarefaEstudoResponseDTO): string {
    const materia = this.materias.find(m => m.id === tarefa.materiaId);
    return materia ? materia.corHex : '#6366F1';
  }
}

