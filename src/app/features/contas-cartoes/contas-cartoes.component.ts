import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CarteiraService } from '../../services/carteira.service';
import { CartaoService } from '../../services/cartao.service';
import { CategoriaService } from '../../services/categoria.service';
import { CarteiraResponse, CarteiraRequest } from '../../models/carteira.models';
import { CartaoCreditoResponse, CartaoCreditoRequest } from '../../models/cartao.models';
import { CategoriaResponse, CategoriaRequest } from '../../models/categoria.models';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-contas-cartoes',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    ReactiveFormsModule, 
    ButtonModule, 
    InputTextModule, 
    DropdownModule, 
    DialogModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './contas-cartoes.component.html',
  styleUrls: ['./contas-cartoes.component.css']
})
export class ContasCartoesComponent implements OnInit {
  carteiras: CarteiraResponse[] = [];
  cartoes: CartaoCreditoResponse[] = [];
  categorias: CategoriaResponse[] = [];

  // Dialogs
  showCarteiraDialog = false;
  showCartaoDialog = false;
  showCategoriaDialog = false;

  // Forms
  carteiraForm = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    tipo: ['CONTA_BANCARIA', Validators.required],
    saldoInicial: [0, Validators.required]
  });

  cartaoForm = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    idCarteira: [null as number | null],
    limite: [0, Validators.required],
    diaFechamento: [1, [Validators.required, Validators.min(1), Validators.max(31)]],
    diaVencimento: [10, [Validators.required, Validators.min(1), Validators.max(31)]]
  });

  categoriaForm = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    tipo: ['DESPESA', Validators.required],
    icone: ['label', Validators.required],
    cor: ['#1e50ff', Validators.required]
  });

  tiposCarteira = [
    { label: 'Conta Bancária', value: 'CONTA_BANCARIA' },
    { label: 'Dinheiro Físico', value: 'DINHEIRO' },
    { label: 'Poupança', value: 'POUPANCA' },
    { label: 'Investimento', value: 'INVESTIMENTO' },
    { label: 'Outros', value: 'OUTROS' }
  ];

  tiposCategoria = [
    { label: 'Despesa', value: 'DESPESA' },
    { label: 'Receita', value: 'RECEITA' }
  ];

  @Input() embedded = false;

  constructor(
    private fb: FormBuilder,
    private carteiraService: CarteiraService,
    private cartaoService: CartaoService,
    private categoriaService: CategoriaService,
    private toast: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.carteiraService.list().subscribe(list => this.carteiras = list);
    this.cartaoService.list().subscribe(list => this.cartoes = list);
    this.categoriaService.list().subscribe(list => this.categorias = list);
  }

  // Carteira
  openCarteiraDialog(): void {
    this.carteiraForm.reset({ nome: '', tipo: 'CONTA_BANCARIA', saldoInicial: 0 });
    this.showCarteiraDialog = true;
  }

  saveCarteira(): void {
    if (this.carteiraForm.invalid) return;
    const payload = this.carteiraForm.getRawValue() as CarteiraRequest;
    this.carteiraService.create(payload).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Carteira criada!' });
        this.showCarteiraDialog = false;
        this.loadAll();
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao criar carteira.' })
    });
  }

  deleteCarteira(carteira: CarteiraResponse): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir a carteira "${carteira.nome}"? Todos os dados associados serão perdidos.`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.carteiraService.delete(carteira.id).subscribe({
          next: () => {
            this.toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Carteira excluída com sucesso.' });
            this.loadAll();
          },
          error: () => this.toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao excluir carteira.' })
        });
      }
    });
  }

  deleteCartao(cartao: CartaoCreditoResponse): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o cartão "${cartao.nome}"? Todos os dados associados serão perdidos.`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.cartaoService.delete(cartao.id).subscribe({
          next: () => {
            this.toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Cartão excluído com sucesso.' });
            this.loadAll();
          },
          error: () => this.toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao excluir cartão.' })
        });
      }
    });
  }

  // Cartão
  openCartaoDialog(): void {
    this.cartaoForm.reset({ nome: '', idCarteira: null, limite: 0, diaFechamento: 1, diaVencimento: 10 });
    this.showCartaoDialog = true;
  }

  saveCartao(): void {
    if (this.cartaoForm.invalid) return;
    const val = this.cartaoForm.getRawValue();
    if (!val.idCarteira) return;
    
    const payload: CartaoCreditoRequest = {
      nome: val.nome,
      idCarteira: val.idCarteira,
      limite: val.limite,
      diaFechamento: val.diaFechamento,
      diaVencimento: val.diaVencimento
    };

    this.cartaoService.create(payload).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Cartão criado!' });
        this.showCartaoDialog = false;
        this.loadAll();
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao criar cartão.' })
    });
  }

  // Categoria
  openCategoriaDialog(): void {
    this.categoriaForm.reset({ nome: '', tipo: 'DESPESA', icone: 'label', cor: '#1e50ff' });
    this.showCategoriaDialog = true;
  }

  saveCategoria(): void {
    if (this.categoriaForm.invalid) return;
    const payload = this.categoriaForm.getRawValue() as CategoriaRequest;
    this.categoriaService.create(payload).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Categoria criada!' });
        this.showCategoriaDialog = false;
        this.loadAll();
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao criar categoria.' })
    });
  }

  deleteCategoria(id: number): void {
    if (!confirm('Deseja excluir esta categoria?')) return;
    this.categoriaService.delete(id).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Categoria removida!' });
        this.loadAll();
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao remover categoria.' })
    });
  }
}
