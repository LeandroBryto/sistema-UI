import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { ReceitaService } from '../../services/receita.service';
import { ReceitaRequest, ReceitaResponse } from '../../models/receita.models';
import { CarteiraService } from '../../services/carteira.service';
import { CategoriaService } from '../../services/categoria.service';
import { CarteiraResponse } from '../../models/carteira.models';
import { CategoriaResponse } from '../../models/categoria.models';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-receitas',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    PaginatorModule,
    InputTextModule,
    ButtonModule,
    DropdownModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './receitas.component.html',
  styleUrls: ['./receitas.component.css'],
})
export class ReceitasComponent implements OnInit {
  loading = false;
  error: string | null = null;
  success: string | null = null;
  itens: ReceitaResponse[] = [];
  editingId: number | null = null;
  globalFilter = '';

  carteiras: CarteiraResponse[] = [];
  categoriasPersonalizadas: CategoriaResponse[] = [];

  filtros = this.fb.nonNullable.group({
    startDate: ['', [Validators.required]],
    endDate: ['', [Validators.required]],
  });

  form = this.fb.nonNullable.group({
    descricao: ['', [Validators.required]],
    categoria: ['', [Validators.required]],
    valor: [0, [Validators.required, Validators.min(0.01)]],
    data: ['', [Validators.required]],
    formaRecebimento: ['', [Validators.required]],
    recorrente: [false],
    observacoes: [''],
    carteiraId: [null as number | null],
    categoriaId: [null as number | null]
  });

  categorias = [
    'SALARIO',
    'FREELANCER',
    'PROVENTO',
    'INVESTIMENTO',
    'BONUS',
    'OUTROS',
  ];
  formas = ['PIX', 'TED', 'ESPECIE', 'BOLETO'];

  constructor(
    private fb: FormBuilder, 
    private api: ReceitaService, 
    private toast: MessageService,
    private confirmationService: ConfirmationService,
    private carteiraService: CarteiraService,
    private categoriaService: CategoriaService
  ) {
    const { start, end } = this.currentMonthRange();
    this.filtros.setValue({ startDate: start, endDate: end });
  }

  ngOnInit(): void {
    this.load();
    this.loadAuxiliares();
  }

  loadAuxiliares(): void {
    this.carteiraService.list().subscribe(l => this.carteiras = l);
    this.categoriaService.list().subscribe(l => this.categoriasPersonalizadas = l.filter(c => c.tipo === 'RECEITA'));
  }

  load(): void {
    if (this.filtros.invalid) {
      this.error = 'Informe início e fim do período (yyyy-MM-dd).';
      return;
    }
    this.loading = true;
    this.error = null;
    const { startDate, endDate } = this.filtros.getRawValue();
    this.api.list(startDate, endDate).subscribe({
      next: (list) => {
        this.itens = list;
        this.loading = false;
      },
      error: (e) => {
        this.loading = false;
        this.error = this.errorMsg(e) || 'Erro ao listar receitas. Ajuste os filtros e tente novamente.';
      },
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.form.reset({
      descricao: '',
      categoria: '',
      valor: 0,
      data: '',
      formaRecebimento: '',
      recorrente: false,
      observacoes: '',
      carteiraId: null,
      categoriaId: null
    });
    this.success = null;
    this.error = null;
  }

  edit(item: ReceitaResponse): void {
    this.editingId = item.id;
    this.form.setValue({
      descricao: item.descricao,
      categoria: item.categoria,
      valor: item.valor,
      data: item.data,
      formaRecebimento: item.formaRecebimento,
      recorrente: item.recorrente ?? false,
      observacoes: item.observacoes ?? '',
      carteiraId: item.carteiraId ?? null,
      categoriaId: item.categoriaId ?? null
    });
    this.success = null;
    this.error = null;
  }

  remove(item: ReceitaResponse): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir a receita "${item.descricao}"? Esta ação não pode ser desfeita.`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.loading = true;
        this.api.delete(item.id).subscribe({
          next: () => {
            this.loading = false;
            this.success = 'Receita removida com sucesso.';
            this.toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Receita removida com sucesso.' });
            this.load();
          },
          error: (e) => {
            this.loading = false;
            this.error = this.errorMsg(e) || 'Falha ao remover a receita. Tente novamente.';
          },
        });
      }
    });
  }

  save(): void {
    if (this.form.invalid) return;
    const payload = this.form.getRawValue() as ReceitaRequest;
    this.loading = true;
    this.error = null;
    this.success = null;

    const req$ =
      this.editingId != null
        ? this.api.update(this.editingId, payload)
        : this.api.create(payload);

    req$.subscribe({
      next: () => {
        this.loading = false;
        this.success = this.editingId
          ? 'Receita atualizada com sucesso.'
          : 'Receita criada com sucesso.';
        this.toast.add({ severity: 'success', summary: 'Sucesso', detail: this.success! });
        this.resetForm();
        this.load();
      },
      error: (e) => {
        this.loading = false;
        this.error = this.errorMsg(e) || 'Falha ao salvar a receita. Verifique os campos e tente novamente.';
      },
    });
  }

  private formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private currentMonthRange(): { start: string; end: string } {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start: this.formatDate(startDate), end: this.formatDate(endDate) };
  }

  private errorMsg(e: any): string | null {
    const status = e?.status;
    if (status === 401) return 'Não autenticado. Entre novamente.';
    if (status === 403) return 'Acesso negado.';
    if (status === 404) return 'Item não encontrado.';
    if (status === 400) return e?.error?.message || 'Dados inválidos.';
    return e?.error?.message || null;
  }
}
