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

  mostrarDialogNovaMateria = false;

  novaMateria: MateriaRequestDTO = {
    nome: '',
    corHex: '#FF6B6B',
    icone: 'book'
  };

  editandoMateria: MateriaResponseDTO | null = null;

  // Lista de ícones disponíveis
  iconesDisponiveis = [
    { label: 'Livro', value: 'book' },
    { label: 'Calculadora', value: 'calculator' },
    { label: 'Relógio', value: 'clock' },
    { label: 'Globo', value: 'globe' },
    { label: 'Coração', value: 'heart' },
    { label: 'Estrela', value: 'star' },
    { label: 'Lápis', value: 'pencil' },
    { label: 'Atômico', value: 'atom' },
    { label: 'DNA', value: 'dna' },
    { label: 'Microscópio', value: 'microscope' }
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
        let mensagem = 'Não foi possível carregar as matérias.';

        if (error.status === 401) {
          mensagem = 'Token inválido ou expirado. Faça login novamente.';
        } else if (error.status === 403) {
          mensagem = 'Acesso negado. Verifique suas permissões.';
        } else if (error.status === 0) {
          mensagem = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: mensagem
        });
        this.loading = false;
      }
    });
  }

  getMateriasFiltradas(): MateriaResponseDTO[] {
    return this.materias;
  }

  abrirDialogNovaMateria(): void {
    this.editandoMateria = null;
    this.novaMateria = {
      nome: '',
      corHex: '#FF6B6B',
      icone: 'book'
    };
    this.mostrarDialogNovaMateria = true;
  }

  abrirDialogEditarMateria(materia: MateriaResponseDTO): void {
    this.editandoMateria = materia;
    this.novaMateria = {
      nome: materia.nome,
      corHex: materia.corHex,
      icone: materia.icone
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

    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i;
    if (!hexRegex.test(this.novaMateria.corHex)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'A cor deve ser um código hexadecimal válido (ex: #FFFFFF).'
      });
      return;
    }

    if (this.editandoMateria) {
      // Atualizar
      this.estudosService.atualizarMateria(this.editandoMateria.id, this.novaMateria).subscribe({
        next: (materia) => {
          const index = this.materias.findIndex(m => m.id === materia.id);
          if (index !== -1) {
            this.materias[index] = materia;
          }
          this.mostrarDialogNovaMateria = false;
          this.editandoMateria = null;
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Matéria atualizada com sucesso!'
          });
        },
        error: (error) => {
          console.error('Erro ao atualizar matéria:', error);
          let mensagem = 'Erro ao atualizar matéria.';

          if (error.status === 401) {
            mensagem = 'Token inválido ou expirado. Faça login novamente.';
          } else if (error.status === 403) {
            mensagem = 'Acesso negado. Verifique suas permissões.';
          } else if (error.error?.message) {
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
    } else {
      // Criar
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

          if (error.status === 401) {
            mensagem = 'Token inválido ou expirado. Faça login novamente.';
          } else if (error.status === 403) {
            mensagem = 'Acesso negado. Verifique suas permissões.';
          } else if (error.error?.message) {
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

  // Método auxiliar para obter o label do ícone
  getIconeLabel(icone: string): string {
    const iconeEncontrado = this.iconesDisponiveis.find(i => i.value === icone);
    return iconeEncontrado ? iconeEncontrado.label : 'Ícone';
  }
}