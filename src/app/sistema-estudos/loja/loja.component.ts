import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LojaService } from '../../services/loja.service';
import { EstudosService } from '../../services/estudos.service';
import { ItemLojaDTO, TipoItemLoja } from '../../models/loja.models';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TabViewModule } from 'primeng/tabview';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-loja',
  standalone: true,
  imports: [
    CommonModule,
    TabViewModule,
    ButtonModule,
    DataViewModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
    CardModule
  ],
  templateUrl: './loja.component.html',
  styleUrls: ['./loja.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class LojaComponent implements OnInit {

  itens: ItemLojaDTO[] = [];
  avatares: ItemLojaDTO[] = [];
  temas: ItemLojaDTO[] = [];
  sons: ItemLojaDTO[] = [];
  moedasNexus: number = 0;

  constructor(
    private lojaService: LojaService,
    private estudosService: EstudosService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.estudosService.getGamificacao().subscribe({
      next: (dados) => {
        this.moedasNexus = dados.moedasNexus;
      },
      error: () => {
        // Mock se falhar
        this.moedasNexus = 1500;
      }
    });

    this.lojaService.getItens().subscribe({
      next: (itens) => {
        this.itens = itens;
        this.distribuirItens();
      },
      error: () => {
        // Mock temporário para visualização
        this.itens = this.getMockItens();
        this.distribuirItens();
      }
    });
  }

  distribuirItens(): void {
    this.avatares = this.itens.filter(i => i.tipo === TipoItemLoja.AVATAR);
    this.temas = this.itens.filter(i => i.tipo === TipoItemLoja.TEMA_FUNDO);
    this.sons = this.itens.filter(i => i.tipo === TipoItemLoja.SOM_AMBIENTE);
  }

  confirmarCompra(item: ItemLojaDTO): void {
    if (item.adquirido) return;

    if (this.moedasNexus < item.preco) {
      this.messageService.add({ severity: 'warn', summary: 'Saldo Insuficiente', detail: `Você precisa de mais ${item.preco - this.moedasNexus} moedas.` });
      return;
    }

    this.confirmationService.confirm({
      message: `Deseja comprar "${item.nome}" por ${item.preco} moedas?`,
      header: 'Confirmar Compra',
      icon: 'pi pi-shopping-cart',
      accept: () => {
        this.comprar(item);
      }
    });
  }

  comprar(item: ItemLojaDTO): void {
    this.lojaService.comprarItem(item.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `Item "${item.nome}" adquirido!` });
        item.adquirido = true;
        this.moedasNexus -= item.preco;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao processar compra.' });
        console.error(err);
      }
    });
  }

  getMockItens(): ItemLojaDTO[] {
    return [
      { id: 1, nome: 'Avatar Cyberpunk', descricao: 'Um avatar futurista.', preco: 500, tipo: TipoItemLoja.AVATAR, urlRecurso: 'assets/avatars/cyber.png', adquirido: false },
      { id: 2, nome: 'Avatar Mago', descricao: 'Um mago sábio.', preco: 500, tipo: TipoItemLoja.AVATAR, urlRecurso: 'assets/avatars/wizard.png', adquirido: true },
      { id: 3, nome: 'Tema Escuro', descricao: 'Modo escuro profundo.', preco: 300, tipo: TipoItemLoja.TEMA_FUNDO, urlRecurso: '', adquirido: false },
      { id: 4, nome: 'Som de Chuva', descricao: 'Barulho de chuva relaxante.', preco: 200, tipo: TipoItemLoja.SOM_AMBIENTE, urlRecurso: '', adquirido: false }
    ];
  }
}
