import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { ContasCartoesComponent } from '../contas-cartoes/contas-cartoes.component';

@Component({
  selector: 'app-conta-restricted',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, RouterLink, ContasCartoesComponent],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div class="header-content">
          <a routerLink="/dashboard" class="back-btn">
            <i class="pi pi-arrow-left"></i>
            <span>Voltar</span>
          </a>
          <h1>Minha Conta (Restrito)</h1>
        </div>
      </header>

      <div class="card-section mb-4">
        <p-card header="Status de Acesso" styleClass="glass-card">
          <p class="m-0">
            Esta é uma tela restrita. Se você está vendo isso, você é um Administrador ou recebeu permissão especial.
          </p>
        </p-card>
      </div>

      <app-contas-cartoes [embedded]="true"></app-contas-cartoes>
    </div>
  `,
  styles: [`
    .page-container {
      padding: clamp(16px, 3vw, 24px);
      min-height: 100vh;
      color: #e2e8f0;
    }
    .page-header { margin-bottom: 32px; }
    .header-content { display: flex; align-items: center; gap: 16px; }
    .header-content h1 { margin: 0; font-size: 1.5rem; color: #fff; }
    .back-btn {
      display: flex; align-items: center; gap: 8px; text-decoration: none;
      color: #60a5fa; font-weight: 600; padding: 8px 16px;
      background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 999px; transition: all 0.2s;
    }
    .back-btn:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }
    :host ::ng-deep .glass-card {
      background: rgba(13, 22, 38, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #e2e8f0;
    }
    :host ::ng-deep .p-card-title { color: #fff; }
  `]
})
export class ContaComponent {}
