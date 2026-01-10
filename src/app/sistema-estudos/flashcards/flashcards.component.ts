import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { EstudosService } from '../../services/estudos.service';
import { MateriaResponseDTO, FlashcardResponseDTO, FlashcardRequestDTO, RevisaoFlashcardDTO, DificuldadeFlashcard } from '../../models/estudos.models';

@Component({
  selector: 'app-sistema-estudos-flashcards',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ProgressBarModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    DialogModule,
    FormsModule,
    ToastModule
  ],
  templateUrl: './flashcards.component.html',
  styleUrls: ['./flashcards.component.css'],
  providers: [MessageService]
})
export class FlashcardsComponent implements OnInit {

  // Enum para usar no template
  DificuldadeFlashcard = DificuldadeFlashcard;

  flashcards: FlashcardResponseDTO[] = [];
  materias: MateriaResponseDTO[] = [];
  loading = true;

  flashcardAtualIndex = 0;
  mostrarResposta = false;
  progresso = 0;

  // Form para novo flashcard
  novoFlashcard: FlashcardRequestDTO = {
    pergunta: '',
    resposta: '',
    materiaId: 0
  };

  mostrarDialogCriar = false;

  dificuldades = [
    { label: 'Fácil', value: DificuldadeFlashcard.FACIL },
    { label: 'Bom', value: DificuldadeFlashcard.BOM },
    { label: 'Difícil', value: DificuldadeFlashcard.DIFICIL },
    { label: 'Errei', value: DificuldadeFlashcard.ERROU }
  ];

  constructor(
    private estudosService: EstudosService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.carregarMaterias();
    this.carregarFlashcardsRevisao();
  }

  carregarMaterias(): void {
    this.estudosService.getMaterias().subscribe({
      next: (materias) => {
        this.materias = materias;
        if (materias.length > 0) {
          this.novoFlashcard.materiaId = materias[0].id;
        }
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

  carregarFlashcardsRevisao(): void {
    this.loading = true;
    console.log('Carregando flashcards para revisão...');
    this.estudosService.getFlashcardsParaRevisao().subscribe({
      next: (flashcards) => {
        console.log('Flashcards carregados:', flashcards);
        this.flashcards = flashcards;
        this.loading = false;
        this.atualizarProgresso();
      },
      error: (error) => {
        console.error('Erro ao carregar flashcards:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os flashcards.'
        });
        this.loading = false;
      }
    });
  }

  get flashcardAtual(): FlashcardResponseDTO | null {
    return this.flashcards.length > 0 ? this.flashcards[this.flashcardAtualIndex] : null;
  }

  virarCartao(): void {
    this.mostrarResposta = !this.mostrarResposta;
  }

  proximaCartao(): void {
    if (this.flashcardAtualIndex < this.flashcards.length - 1) {
      this.flashcardAtualIndex++;
      this.mostrarResposta = false;
    }
  }

  cartaoAnterior(): void {
    if (this.flashcardAtualIndex > 0) {
      this.flashcardAtualIndex--;
      this.mostrarResposta = false;
    }
  }

  revisarFlashcard(dificuldade: DificuldadeFlashcard): void {
    if (!this.flashcardAtual) return;

    const revisao: RevisaoFlashcardDTO = { dificuldade };

    this.estudosService.revisarFlashcard(this.flashcardAtual.id, revisao).subscribe({
      next: (flashcardAtualizado) => {
        // Remove o card da lista atual
        this.flashcards.splice(this.flashcardAtualIndex, 1);

        // Se não há mais cards, volta ao início
        if (this.flashcards.length === 0) {
          this.flashcardAtualIndex = 0;
          this.mostrarResposta = false;
        } else if (this.flashcardAtualIndex >= this.flashcards.length) {
          this.flashcardAtualIndex = this.flashcards.length - 1;
        }

        this.atualizarProgresso();
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Flashcard revisado! +5 XP'
        });
      },
      error: (error) => {
        console.error('Erro ao revisar flashcard:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível revisar o flashcard.'
        });
      }
    });
  }

  atualizarProgresso(): void {
    // Como os cards são removidos após revisão, progresso é baseado no índice atual
    if (this.flashcards.length === 0) {
      this.progresso = 100;
    } else {
      // Mostra progresso baseado na posição atual no array restante
      this.progresso = ((this.flashcardAtualIndex + 1) / this.flashcards.length) * 100;
    }
  }

  abrirDialogCriar(): void {
    this.novoFlashcard = {
      pergunta: '',
      resposta: '',
      materiaId: this.materias.length > 0 ? this.materias[0].id : 0
    };
    this.mostrarDialogCriar = true;
  }

  criarFlashcard(): void {
    if (!this.novoFlashcard.pergunta.trim() || !this.novoFlashcard.resposta.trim() || !this.novoFlashcard.materiaId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Preencha todos os campos obrigatórios.'
      });
      return;
    }

    this.estudosService.criarFlashcard(this.novoFlashcard).subscribe({
      next: (flashcard) => {
        this.mostrarDialogCriar = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Flashcard criado com sucesso!'
        });
        // Não adiciona à lista de revisão, pois novos cards não são para revisão imediata
      },
      error: (error) => {
        console.error('Erro ao criar flashcard:', error);
        let mensagem = 'Erro ao criar flashcard.';

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

  getCorDificuldade(dificuldade: DificuldadeFlashcard): string {
    switch (dificuldade) {
      case DificuldadeFlashcard.FACIL: return '#4CAF50';
      case DificuldadeFlashcard.BOM: return '#2196F3';
      case DificuldadeFlashcard.DIFICIL: return '#FF9800';
      case DificuldadeFlashcard.ERROU: return '#F44336';
      default: return '#9E9E9E';
    }
  }

  getTextoDificuldade(dificuldade: DificuldadeFlashcard): string {
    switch (dificuldade) {
      case DificuldadeFlashcard.FACIL: return 'Fácil';
      case DificuldadeFlashcard.BOM: return 'Bom';
      case DificuldadeFlashcard.DIFICIL: return 'Difícil';
      case DificuldadeFlashcard.ERROU: return 'Errei';
      default: return 'Não visto';
    }
  }
}