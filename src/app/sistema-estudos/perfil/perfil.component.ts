import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

interface Conquista {
  id: number;
  titulo: string;
  descricao: string;
  icone: string;
  desbloqueada: boolean;
  progresso: number;
  progressoMax: number;
}

interface Estatistica {
  titulo: string;
  valor: number;
  unidade: string;
  icone: string;
  cor: string;
}

@Component({
  selector: 'app-sistema-estudos-perfil',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ProgressBarModule,
    AvatarModule,
    BadgeModule,
    DialogModule,
    InputTextModule,
    FormsModule
  ],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {

  usuario = {
    nome: 'João Silva',
    nivel: 12,
    xp: 2450,
    xpProximoNivel: 3000,
    moedas: 1250,
    avatar: 'J',
    corAvatar: '#667eea'
  };

  estatisticas: Estatistica[] = [
    {
      titulo: 'Dias Estudados',
      valor: 28,
      unidade: 'dias',
      icone: 'pi pi-calendar',
      cor: '#4CAF50'
    },
    {
      titulo: 'Horas de Estudo',
      valor: 156,
      unidade: 'horas',
      icone: 'pi pi-clock',
      cor: '#FF9800'
    },
    {
      titulo: 'Flashcards Revisados',
      valor: 450,
      unidade: 'cards',
      icone: 'pi pi-book',
      cor: '#9C27B0'
    },
    {
      titulo: 'Sequência Atual',
      valor: 7,
      unidade: 'dias',
      icone: 'pi pi-fire',
      cor: '#F44336'
    }
  ];

  conquistas: Conquista[] = [
    {
      id: 1,
      titulo: 'Primeiro Passo',
      descricao: 'Complete sua primeira sessão de estudo',
      icone: 'pi pi-play-circle',
      desbloqueada: true,
      progresso: 1,
      progressoMax: 1
    },
    {
      id: 2,
      titulo: 'Estudioso',
      descricao: 'Estude por 10 dias consecutivos',
      icone: 'pi pi-calendar-plus',
      desbloqueada: true,
      progresso: 10,
      progressoMax: 10
    },
    {
      id: 3,
      titulo: 'Mestre dos Flashcards',
      descricao: 'Revise 100 flashcards',
      icone: 'pi pi-bookmark',
      desbloqueada: true,
      progresso: 100,
      progressoMax: 100
    },
    {
      id: 4,
      titulo: 'Maratonista',
      descricao: 'Estude por 5 horas em um dia',
      icone: 'pi pi-clock',
      desbloqueada: false,
      progresso: 3,
      progressoMax: 5
    },
    {
      id: 5,
      titulo: 'Perfeccionista',
      descricao: 'Complete 50 sessões perfeitas',
      icone: 'pi pi-star',
      desbloqueada: false,
      progresso: 23,
      progressoMax: 50
    },
    {
      id: 6,
      titulo: 'Colecionador',
      descricao: 'Crie 20 flashcards',
      icone: 'pi pi-plus-circle',
      desbloqueada: true,
      progresso: 20,
      progressoMax: 20
    }
  ];

  mostrarDialogEditar = false;
  nomeEditado = '';

  constructor() { }

  ngOnInit(): void {
    this.nomeEditado = this.usuario.nome;
  }

  get progressoNivel(): number {
    return (this.usuario.xp / this.usuario.xpProximoNivel) * 100;
  }

  abrirDialogEditar(): void {
    this.nomeEditado = this.usuario.nome;
    this.mostrarDialogEditar = true;
  }

  salvarPerfil(): void {
    this.usuario.nome = this.nomeEditado;
    this.mostrarDialogEditar = false;
  }

  getConquistasDesbloqueadas(): Conquista[] {
    return this.conquistas.filter(c => c.desbloqueada);
  }

  getConquistasBloqueadas(): Conquista[] {
    return this.conquistas.filter(c => !c.desbloqueada);
  }

  getProgressoConquista(conquista: Conquista): number {
    return (conquista.progresso / conquista.progressoMax) * 100;
  }
}