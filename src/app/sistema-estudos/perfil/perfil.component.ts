import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { AvatarModule } from 'primeng/avatar';
import { PerfilService } from '../../services/perfil.service';
import { PerfilCompletoResponse } from '../../models/perfil.models';

@Component({
  selector: 'app-sistema-estudos-perfil',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ProgressBarModule,
    AvatarModule
  ],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {

  perfil: PerfilCompletoResponse | null = null;

  constructor(private perfilService: PerfilService) { }

  ngOnInit(): void {
    this.carregarPerfil();
  }

  carregarPerfil(): void {
    this.perfilService.getMeuPerfil().subscribe({
      next: (data) => {
        this.perfil = data;
      },
      error: (error) => {
        console.error('Erro ao carregar perfil:', error);
      }
    });
  }

  get progressoNivel(): number {
    if (!this.perfil) return 0;
    const xpAtualNoNivel = this.perfil.resumo.xp % 1000;
    return (xpAtualNoNivel / 1000) * 100;
  }

  get avatarUrl(): string {
    if (!this.perfil?.resumo.avatar || this.perfil.resumo.avatar.trim() === '') {
      return 'assets/default-avatar.png';
    }
    return this.perfil.resumo.avatar;
  }
}