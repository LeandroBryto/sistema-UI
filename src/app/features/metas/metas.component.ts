import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { GoalService } from '../../services/goal.service';
import { GoalResponse, GoalRequest } from '../../models/goal.models';
import { CategoriaResponse } from '../../models/categoria.models';

@Component({
  selector: 'app-metas',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    FormsModule, 
    ButtonModule, 
    ProgressBarModule, 
    DialogModule, 
    InputTextModule, 
    InputTextareaModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './metas.component.html',
  styleUrls: ['./metas.component.css']
})
export class MetasComponent implements OnInit {
  // Metas (Real data from GoalService)
  metas: GoalResponse[] = [];

  // Meta dialog
  showMetaDialog = false;
  novaMeta = { nomeDaMeta: '', valorMeta: 0, valorAcumulado: 0, observacao: '', previsaoConclusao: '' };
  editingMetaId: number | null = null;

  constructor(
    private goalService: GoalService,
    private toast: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadMetas();
  }

  loadMetas(): void {
    this.goalService.list().subscribe({
      next: (data) => this.metas = data,
      error: () => this.toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar metas.' })
    });
  }

  // Meta methods
  openMetaDialog(meta?: GoalResponse): void {
    if (meta) {
      this.editingMetaId = meta.id;
      this.novaMeta = { nomeDaMeta: meta.meta, valorMeta: meta.valorMeta, valorAcumulado: meta.valorAcumulado, observacao: meta.descricao || '', previsaoConclusao: meta.previsaoConclusao };
    } else {
      this.editingMetaId = null;
      this.novaMeta = { nomeDaMeta: '', valorMeta: 0, valorAcumulado: 0, observacao: '', previsaoConclusao: '' };
    }
    this.showMetaDialog = true;
  }

  saveMeta(): void {
    const payload: GoalRequest = {
      meta: this.novaMeta.nomeDaMeta,
      descricao: this.novaMeta.observacao || undefined,
      valorMeta: this.novaMeta.valorMeta,
      valorAcumulado: this.novaMeta.valorAcumulado || undefined,
      previsaoConclusao: this.novaMeta.previsaoConclusao || undefined
    };
    const req$ = this.editingMetaId
      ? this.goalService.update(this.editingMetaId, payload)
      : this.goalService.create(payload);

    req$.subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Sucesso', detail: this.editingMetaId ? 'Meta atualizada!' : 'Meta criada!' });
        this.showMetaDialog = false;
        this.editingMetaId = null;
        this.loadMetas();
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao salvar meta.' })
    });
  }

  deleteMeta(meta: GoalResponse): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir a meta "${meta.meta}"? Esta ação não pode ser desfeita.`,
      header: 'Confirmar Exclusão',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.goalService.delete(meta.id).subscribe({
          next: () => {
            this.toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Meta excluída!' });
            this.loadMetas();
          },
          error: () => this.toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao excluir meta.' })
        });
      }
    });
  }
}
