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

interface EventoEstudo {
  id: number;
  titulo: string;
  descricao: string;
  data: Date;
  horaInicio: string;
  horaFim: string;
  materia: string;
  tipo: 'estudo' | 'revisao' | 'prova';
  concluido: boolean;
}

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
    FormsModule
  ],
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.css']
})
export class AgendaComponent implements OnInit {

  eventos: EventoEstudo[] = [
    {
      id: 1,
      titulo: 'Revisão de Matemática',
      descricao: 'Revisar funções quadráticas e trigonometria',
      data: new Date(),
      horaInicio: '14:00',
      horaFim: '16:00',
      materia: 'Matemática',
      tipo: 'revisao',
      concluido: false
    },
    {
      id: 2,
      titulo: 'Estudo de Física',
      descricao: 'Estudar mecânica clássica',
      data: new Date(Date.now() + 86400000), // amanhã
      horaInicio: '09:00',
      horaFim: '11:00',
      materia: 'Física',
      tipo: 'estudo',
      concluido: false
    }
  ];

  dataSelecionada: Date = new Date();
  mostrarDialog = false;

  novoEvento: Partial<EventoEstudo> = {
    titulo: '',
    descricao: '',
    data: new Date(),
    horaInicio: '08:00',
    horaFim: '10:00',
    materia: '',
    tipo: 'estudo'
  };

  materias = [
    { label: 'Matemática', value: 'Matemática' },
    { label: 'Física', value: 'Física' },
    { label: 'Química', value: 'Química' },
    { label: 'Biologia', value: 'Biologia' },
    { label: 'História', value: 'História' },
    { label: 'Geografia', value: 'Geografia' },
    { label: 'Português', value: 'Português' },
    { label: 'Inglês', value: 'Inglês' }
  ];

  tiposEvento = [
    { label: 'Estudo', value: 'estudo' },
    { label: 'Revisão', value: 'revisao' },
    { label: 'Prova', value: 'prova' }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  getEventosDoDia(data: Date): EventoEstudo[] {
    return this.eventos.filter(evento =>
      evento.data.toDateString() === data.toDateString()
    ).sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  }

  abrirDialogNovoEvento(): void {
    this.novoEvento = {
      titulo: '',
      descricao: '',
      data: this.dataSelecionada,
      horaInicio: '08:00',
      horaFim: '10:00',
      materia: '',
      tipo: 'estudo'
    };
    this.mostrarDialog = true;
  }

  salvarEvento(): void {
    if (this.novoEvento.titulo && this.novoEvento.materia) {
      const evento: EventoEstudo = {
        id: this.eventos.length + 1,
        titulo: this.novoEvento.titulo!,
        descricao: this.novoEvento.descricao || '',
        data: this.novoEvento.data!,
        horaInicio: this.novoEvento.horaInicio!,
        horaFim: this.novoEvento.horaFim!,
        materia: this.novoEvento.materia!,
        tipo: this.novoEvento.tipo as 'estudo' | 'revisao' | 'prova',
        concluido: false
      };

      this.eventos.push(evento);
      this.mostrarDialog = false;
    }
  }

  marcarComoConcluido(evento: EventoEstudo): void {
    evento.concluido = !evento.concluido;
  }

  excluirEvento(evento: EventoEstudo): void {
    const index = this.eventos.indexOf(evento);
    if (index > -1) {
      this.eventos.splice(index, 1);
    }
  }

  getCorTipo(tipo: string): string {
    switch (tipo) {
      case 'estudo': return '#4CAF50';
      case 'revisao': return '#FF9800';
      case 'prova': return '#F44336';
      default: return '#9E9E9E';
    }
  }

  getTextoTipo(tipo: string): string {
    switch (tipo) {
      case 'estudo': return 'Estudo';
      case 'revisao': return 'Revisão';
      case 'prova': return 'Prova';
      default: return 'Desconhecido';
    }
  }

  formatarData(data: Date): string {
    return data.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}