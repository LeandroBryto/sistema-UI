import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TabViewModule } from 'primeng/tabview';
import { OrcamentoService } from '../../services/orcamento.service';
import { CategoriaService } from '../../services/categoria.service';
import { OrcamentoResponse, OrcamentoRequest } from '../../models/orcamento.models';
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
    CardModule,
    ToastModule,
    TabViewModule
  ],
  providers: [MessageService],
  templateUrl: './metas.component.html',
  styleUrls: ['./metas.component.css']
})
export class MetasComponent implements OnInit {
  // Metas (código existente)
  metas = [
    { nome: 'Reserva de Emergência', atual: 5000, alvo: 15000, progresso: 33 },
    { nome: 'Viagem Fim de Ano', atual: 2000, alvo: 8000, progresso: 25 },
    { nome: 'Trocar de Carro', atual: 15000, alvo: 60000, progresso: 25 }
  ];

  // Orçamentos
  orcamentos: OrcamentoResponse[] = [];
  categorias: CategoriaResponse[] = [];
  showOrcamentoDialog = false;
  novoOrcamento = { idCategoria: 0, limiteMensal: 0, limiteAlerta: 0 };
  mesAtual = new Date().getMonth() + 1;
  anoAtual = new Date().getFullYear();

  constructor(
    private orcamentoService: OrcamentoService,
    private categoriaService: CategoriaService,
    private toast: MessageService
  ) {}

  ngOnInit(): void {
    this.loadOrcamentos();
    this.loadCategorias();
  }

  loadOrcamentos(): void {
    this.orcamentoService.list(this.mesAtual, this.anoAtual).subscribe(list => this.orcamentos = list);
  }

  loadCategorias(): void {
    this.categoriaService.list().subscribe(list => this.categorias = list.filter(c => c.tipo === 'DESPESA'));
  }

  openOrcamentoDialog(): void {
    this.novoOrcamento = { idCategoria: 0, limiteMensal: 0, limiteAlerta: 0 };
    this.showOrcamentoDialog = true;
  }

  saveOrcamento(): void {
    if (!this.novoOrcamento.idCategoria || this.novoOrcamento.limiteMensal <= 0) {
      this.toast.add({ severity: 'warn', summary: 'Atenção', detail: 'Preencha os campos corretamente.' });
      return;
    }

    const payload: OrcamentoRequest = {
      ...this.novoOrcamento,
      mes: this.mesAtual,
      ano: this.anoAtual
    };

    this.orcamentoService.save(payload).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Orçamento definido!' });
        this.showOrcamentoDialog = false;
        this.loadOrcamentos();
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao salvar orçamento.' })
    });
  }

  getCategoriaNome(id: number): string {
    return this.categorias.find(c => c.id === id)?.nome || 'Categoria Desconhecida';
  }
}
