import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sistema-estudos-modo-foco',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, InputTextareaModule, FormsModule],
  templateUrl: './modo-foco.component.html',
  styleUrls: ['./modo-foco.component.css']
})
export class ModoFocoComponent implements OnInit, OnDestroy {

  tempoRestante = 25 * 60; // 25 minutos em segundos
  isRunning = false;
  isPaused = false;
  interval: any;

  materiaAtual = {
    nome: 'Matemática',
    corHex: '#FF6B6B'
  };

  anotacoes = '';

  constructor() { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  formatarTempo(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`;
  }

  iniciarTimer(): void {
    this.isRunning = true;
    this.isPaused = false;
    this.interval = setInterval(() => {
      if (this.tempoRestante > 0) {
        this.tempoRestante--;
      } else {
        this.finalizarSessao();
      }
    }, 1000);
  }

  pausarTimer(): void {
    this.isPaused = true;
    this.isRunning = false;
    if (this.interval) {
      clearInterval(this.interval);
    }
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
    // Aqui seria implementada a lógica para salvar a sessão
    alert('Sessão finalizada! Você ganhou XP e moedas.');
  }

  reiniciarTimer(): void {
    this.tempoRestante = 25 * 60;
    this.isRunning = false;
    this.isPaused = false;
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}