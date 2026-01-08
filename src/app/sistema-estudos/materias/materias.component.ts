import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ColorPickerModule } from 'primeng/colorpicker';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { EstudosService } from '../../services/estudos.service';
import { MateriaResponseDTO, MateriaRequestDTO } from '../../models/estudos.models';

@Component({
  selector: 'app-sistema-estudos-materias',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ProgressBarModule,
    BadgeModule,
    DialogModule,
    InputTextModule,
    ColorPickerModule,
    DropdownModule,
    FormsModule,
    ToastModule
  ],
  templateUrl: './materias.component.html',
  styleUrls: ['./materias.component.css'],
  providers: [MessageService]
})
export class MateriasComponent implements OnInit {

  materias: MateriaResponseDTO[] = [];
  loading = true;

  mostrarArquivadas = false;
  mostrarDialogNovaMateria = false;

  novaMateria: MateriaRequestDTO = {
    nome: '',
    corHex: '#FF6B6B',
    icone: 'pi pi-book'
  };

  // Lista de ícones disponíveis
  iconesDisponiveis = [
    { label: 'Livro', value: 'pi pi-book' },
    { label: 'Calculadora', value: 'pi pi-calculator' },
    { label: 'Relógio', value: 'pi pi-clock' },
    { label: 'Globo', value: 'pi pi-globe' },
    { label: 'Coração', value: 'pi pi-heart' },
    { label: 'Estrela', value: 'pi pi-star' },
    { label: 'Lápis', value: 'pi pi-pencil' },
    { label: 'Atômico', value: 'pi pi-atom' },
    { label: 'DNA', value: 'pi pi-dna' },
    { label: 'Microscópio', value: 'pi pi-microscope' }
  ];

  constructor(
    private estudosService: EstudosService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.carregarMaterias();
  }

  carregarMaterias(): void {
    this.loading = true;
    this.estudosService.getMaterias().subscribe({
      next: (materias) => {
        this.materias = materias;
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

  toggleArquivadas(): void {
    this.mostrarArquivadas = !this.mostrarArquivadas;
  }

  getMateriasFiltradas(): MateriaResponseDTO[] {
    return this.materias.filter(m => !m.arquivada || this.mostrarArquivadas);
  }

  abrirDialogNovaMateria(): void {
    this.novaMateria = {
      nome: '',
      corHex: '#FF6B6B',
      icone: 'pi pi-book'
    };
    this.mostrarDialogNovaMateria = true;
  }

  salvarNovaMateria(): void {
    if (!this.novaMateria.nome.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'O nome da matéria é obrigatório.'
      });
      return;
    }

    this.estudosService.criarMateria(this.novaMateria).subscribe({
      next: (materia) => {
        this.materias.push(materia);
        this.mostrarDialogNovaMateria = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Matéria criada com sucesso!'
        });
      },
      error: (error) => {
        console.error('Erro ao criar matéria:', error);
        let mensagem = 'Erro ao criar matéria.';

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

  excluirMateria(materia: MateriaResponseDTO): void {
    if (confirm(`Tem certeza que deseja excluir a matéria "${materia.nome}"?`)) {
      this.estudosService.excluirMateria(materia.id).subscribe({
        next: () => {
          this.materias = this.materias.filter(m => m.id !== materia.id);
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Matéria excluída com sucesso!'
          });
        },
        error: (error) => {
          console.error('Erro ao excluir matéria:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível excluir a matéria.'
          });
        }
      });
    }
  }

  arquivarMateria(materia: MateriaResponseDTO): void {
    this.estudosService.arquivarMateria(materia.id).subscribe({
      next: () => {
        materia.arquivada = true;
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Matéria arquivada com sucesso!'
        });
      },
      error: (error) => {
        console.error('Erro ao arquivar matéria:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível arquivar a matéria.'
        });
      }
    });
  }

  // Método auxiliar para obter o label do ícone
  getIconeLabel(icone: string): string {
    const iconeEncontrado = this.iconesDisponiveis.find(i => i.value === icone);
    return iconeEncontrado ? iconeEncontrado.label : 'Ícone';
  }
}