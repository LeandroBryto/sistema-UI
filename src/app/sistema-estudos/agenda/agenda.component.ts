import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

import { EstudosService } from '../../services/estudos.service';
import { AgendaService } from '../../services/agenda.service';
import { MateriaResponseDTO } from '../../models/estudos.models';
import { AgendaResponseDTO, CriarItemAgendaRequest, DiaSemana } from '../../models/agenda.models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sistema-estudos-agenda',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    CalendarModule,
    DialogModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    FormsModule,
    ToastModule
  ],
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.css'],
  providers: [MessageService]
})
export class AgendaComponent implements OnInit {

  agendaSemanal: AgendaResponseDTO[] = [];
  agendaHoje: AgendaResponseDTO[] = [];
  materias: MateriaResponseDTO[] = [];
  loading = true;

  selectedItem: AgendaResponseDTO | null = null;
  viewMode: 'semana' | 'hoje' = 'semana';

  mostrarDialog = false;

  novoItem: CriarItemAgendaRequest = {
    materiaId: 0,
    diaSemana: DiaSemana.SEGUNDA,
    horarioInicio: '08:00',
    horarioFim: '10:00'
  };

  diasSemana = [
    { label: 'Segunda-feira', value: DiaSemana.SEGUNDA },
    { label: 'Terça-feira', value: DiaSemana.TERCA },
    { label: 'Quarta-feira', value: DiaSemana.QUARTA },
    { label: 'Quinta-feira', value: DiaSemana.QUINTA },
    { label: 'Sexta-feira', value: DiaSemana.SEXTA },
    { label: 'Sábado', value: DiaSemana.SABADO },
    { label: 'Domingo', value: DiaSemana.DOMINGO }
  ];

  constructor(
    private estudosService: EstudosService,
    private agendaService: AgendaService,
    private messageService: MessageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.carregarMaterias();
    this.carregarAgenda();
  }

  carregarMaterias(): void {
    this.estudosService.getMaterias().subscribe({
      next: (materias) => {
        this.materias = materias;
      },
      error: (error) => {
        console.error('Erro ao carregar matérias:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar as matérias.'
        });
      }
    });
  }

  carregarAgenda(): void {
    this.loading = true;
    this.agendaService.getAgendaSemanal().subscribe({
      next: (agenda) => {
        this.agendaSemanal = agenda;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar agenda semanal:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar a agenda semanal.'
        });
        this.loading = false;
      }
    });

    this.agendaService.getAgendaHoje().subscribe({
      next: (agenda) => {
        this.agendaHoje = agenda;
      },
      error: (error) => {
        console.error('Erro ao carregar agenda hoje:', error);
      }
    });
  }

  abrirDialog(): void {
    this.novoItem = {
      materiaId: this.materias.length > 0 ? this.materias[0].id : 0,
      diaSemana: DiaSemana.SEGUNDA,
      horarioInicio: '08:00',
      horarioFim: '10:00'
    };
    this.mostrarDialog = true;
  }

  salvarItem(): void {
    if (!this.novoItem.materiaId || !this.novoItem.diaSemana || !this.novoItem.horarioInicio || !this.novoItem.horarioFim) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Preencha todos os campos obrigatórios.'
      });
      return;
    }

    this.agendaService.criarItemAgenda(this.novoItem).subscribe({
      next: (item) => {
        this.mostrarDialog = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Item adicionado à agenda com sucesso!'
        });
        this.carregarAgenda(); // Recarregar para atualizar a lista
      },
      error: (error) => {
        console.error('Erro ao criar item na agenda:', error);
        let mensagem = 'Erro ao adicionar item à agenda.';

        if (error.error?.message) {
          mensagem = error.error.message;
        } else if (error.status === 400) {
          mensagem = 'Dados inválidos. Verifique os campos.';
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: mensagem
        });
      }
    });
  }

  excluirItem(item: AgendaResponseDTO): void {
    if (confirm('Tem certeza que deseja remover este item da agenda?')) {
      this.agendaService.excluirItemAgenda(item.id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Item removido da agenda com sucesso!'
          });
          this.carregarAgenda(); // Recarregar para atualizar a lista
        },
        error: (error) => {
          console.error('Erro ao excluir item da agenda:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível remover o item da agenda.'
          });
        }
      });
    }
  }

  getAgendaPorDia(dia: DiaSemana): AgendaResponseDTO[] {
    const diaString = this.diaSemanaEnumToString(dia);
    return this.agendaSemanal.filter(item => item.diaSemana === diaString);
  }

  getNomeMateria(item: AgendaResponseDTO): string {
    return item.nomeMateria;
  }

  getCorMateria(item: AgendaResponseDTO): string {
    return item.corMateria;
  }

  isDiaAtual(dia: DiaSemana): boolean {
    const hoje = new Date().getDay();
    const diaMap = {
      [DiaSemana.DOMINGO]: 0,
      [DiaSemana.SEGUNDA]: 1,
      [DiaSemana.TERCA]: 2,
      [DiaSemana.QUARTA]: 3,
      [DiaSemana.QUINTA]: 4,
      [DiaSemana.SEXTA]: 5,
      [DiaSemana.SABADO]: 6
    };
    return diaMap[dia] === hoje;
  }

  getTempoTotalDia(dia: DiaSemana): string {
    const itens = this.getAgendaPorDia(dia);
    let totalMinutos = 0;
    itens.forEach(item => {
      const inicio = this.parseTime(item.horarioInicio);
      const fim = this.parseTime(item.horarioFim);
      if (inicio && fim) {
        totalMinutos += (fim - inicio) / (1000 * 60); // diferença em minutos
      }
    });
    const horas = Math.floor(totalMinutos / 60);
    const minutos = Math.floor(totalMinutos % 60);
    return horas > 0 ? `${horas}h ${minutos}min` : `${minutos}min`;
  }

  private parseTime(time: string): number | null {
    const [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return null;
    return new Date(0, 0, 0, hours, minutes).getTime();
  }

  iniciarEstudo(item: AgendaResponseDTO): void {
    // Como não temos materiaId, talvez buscar por nome
    const materia = this.materias.find(m => m.nome === item.nomeMateria);
    if (materia) {
      this.router.navigate(['/estudos/modo-foco'], { queryParams: { materiaId: materia.id } });
    }
  }

  selecionarItem(item: AgendaResponseDTO): void {
    this.selectedItem = this.selectedItem === item ? null : item;
  }

  alternarViewMode(mode: 'semana' | 'hoje'): void {
    this.viewMode = mode;
    this.selectedItem = null; // Reset selection
  }

  private diaSemanaEnumToString(dia: DiaSemana): string {
    const map = {
      [DiaSemana.DOMINGO]: 'SUNDAY',
      [DiaSemana.SEGUNDA]: 'MONDAY',
      [DiaSemana.TERCA]: 'TUESDAY',
      [DiaSemana.QUARTA]: 'WEDNESDAY',
      [DiaSemana.QUINTA]: 'THURSDAY',
      [DiaSemana.SEXTA]: 'FRIDAY',
      [DiaSemana.SABADO]: 'SATURDAY'
    };
    return map[dia] || 'MONDAY';
  }
}