import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

interface Flashcard {
  id: number;
  pergunta: string;
  resposta: string;
  dificuldade: 'facil' | 'medio' | 'dificil';
  revisado: boolean;
}

@Component({
  selector: 'app-sistema-estudos-flashcards',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, ProgressBarModule, InputTextModule, FormsModule],
  templateUrl: './flashcards.component.html',
  styleUrls: ['./flashcards.component.css']
})
export class FlashcardsComponent implements OnInit {

  flashcards: Flashcard[] = [
    {
      id: 1,
      pergunta: 'O que é uma função quadrática?',
      resposta: 'Uma função do segundo grau, representada por f(x) = ax² + bx + c',
      dificuldade: 'medio',
      revisado: false
    },
    {
      id: 2,
      pergunta: 'Qual é a fórmula de Bhaskara?',
      resposta: 'x = [-b ± √(b² - 4ac)] / 2a',
      dificuldade: 'dificil',
      revisado: false
    },
    {
      id: 3,
      pergunta: 'O que é um número primo?',
      resposta: 'Um número natural maior que 1 que só é divisível por 1 e por ele mesmo',
      dificuldade: 'facil',
      revisado: false
    }
  ];

  flashcardAtualIndex = 0;
  mostrarResposta = false;
  progresso = 0;

  novaPergunta = '';
  novaResposta = '';
  novaDificuldade: 'facil' | 'medio' | 'dificil' = 'medio';

  constructor() { }

  ngOnInit(): void {
    this.atualizarProgresso();
  }

  get flashcardAtual(): Flashcard {
    return this.flashcards[this.flashcardAtualIndex];
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

  marcarComoRevisado(): void {
    this.flashcardAtual.revisado = true;
    this.atualizarProgresso();
    this.proximaCartao();
  }

  atualizarProgresso(): void {
    const revisados = this.flashcards.filter(card => card.revisado).length;
    this.progresso = (revisados / this.flashcards.length) * 100;
  }

  adicionarFlashcard(): void {
    if (this.novaPergunta.trim() && this.novaResposta.trim()) {
      const novoFlashcard: Flashcard = {
        id: this.flashcards.length + 1,
        pergunta: this.novaPergunta,
        resposta: this.novaResposta,
        dificuldade: this.novaDificuldade,
        revisado: false
      };

      this.flashcards.push(novoFlashcard);
      this.novaPergunta = '';
      this.novaResposta = '';
      this.novaDificuldade = 'medio';
      this.atualizarProgresso();
    }
  }

  getCorDificuldade(dificuldade: string): string {
    switch (dificuldade) {
      case 'facil': return '#4CAF50';
      case 'medio': return '#FF9800';
      case 'dificil': return '#F44336';
      default: return '#9E9E9E';
    }
  }

  getTextoDificuldade(dificuldade: string): string {
    switch (dificuldade) {
      case 'facil': return 'Fácil';
      case 'medio': return 'Médio';
      case 'dificil': return 'Difícil';
      default: return 'Desconhecido';
    }
  }
}