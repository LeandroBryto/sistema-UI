import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-sistema-estudos-materias',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, ProgressBarModule, BadgeModule],
  templateUrl: './materias.component.html',
  styleUrls: ['./materias.component.css']
})
export class MateriasComponent implements OnInit {

  materias = [
    {
      id: 1,
      nome: 'Matemática',
      corHex: '#FF6B6B',
      icone: 'pi pi-calculator',
      topicosConcluidos: 7,
      totalTopicos: 12,
      arquivada: false
    },
    {
      id: 2,
      nome: 'Português',
      corHex: '#4ECDC4',
      icone: 'pi pi-book',
      topicosConcluidos: 5,
      totalTopicos: 8,
      arquivada: false
    },
    {
      id: 3,
      nome: 'História',
      corHex: '#45B7D1',
      icone: 'pi pi-clock',
      topicosConcluidos: 3,
      totalTopicos: 10,
      arquivada: false
    }
  ];

  mostrarArquivadas = false;

  constructor() { }

  ngOnInit(): void {
  }

  toggleArquivadas(): void {
    this.mostrarArquivadas = !this.mostrarArquivadas;
  }

  getMateriasFiltradas(): any[] {
    return this.materias.filter(m => !m.arquivada || this.mostrarArquivadas);
  }

  calcularProgresso(materia: any): number {
    return (materia.topicosConcluidos / materia.totalTopicos) * 100;
  }
}