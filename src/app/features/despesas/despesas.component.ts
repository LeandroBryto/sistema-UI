import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DespesaService } from '../../services/despesa.service';
import { DespesaRequest, DespesaResponse } from '../../models/despesa.models';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-despesas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    FormsModule,
    TableModule,
    PaginatorModule,
    InputTextModule,
    ButtonModule,
    DropdownModule,
    TagModule,
    CalendarModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './despesas.component.html',
  styleUrls: ['./despesas.component.css'],
})
export class DespesasComponent {
  loading = false;
  error: string | null = null;
  success: string | null = null;
  itens: DespesaResponse[] = [];
  editingId: number | null = null;
  globalFilter = '';

  filtros = this.fb.nonNullable.group({
    startDate: [''],
    endDate: [''],
  });

  form = this.fb.nonNullable.group({
    descricao: ['', [Validators.required]],
    categoria: ['', [Validators.required]],
    valor: [0, [Validators.required, Validators.min(0.01)]],
    data: ['', [Validators.required]],
    formaPagamento: ['', [Validators.required]],
    statusPagamento: ['', [Validators.required]],
    recorrente: [false],
    notificarAntesVencimento: [null as number | null],
    observacoes: [''],
  });

  categorias = [
    'ALUGUEL',
    'COMIDA',
    'TRANSPORTE',
    'SAUDE',
    'INVESTIMENTO',
    'EDUCACAO',
    'DIVIDA',
    'OUTROS',
  ];
  formas = ['PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'DINHEIRO'];
  status = ['PAGO', 'PENDENTE', 'ATRASADO'];

  constructor(private fb: FormBuilder, private api: DespesaService, private toast: MessageService) {
    const { start, end } = this.currentMonthRange();
    this.filtros.setValue({ startDate: start, endDate: end });
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    const { startDate, endDate } = this.filtros.getRawValue();
    this.api.list(startDate || undefined, endDate || undefined).subscribe({
      next: (list) => {
        this.itens = list;
        this.loading = false;
      },
      error: (e) => {
        this.loading = false;
        this.error =
          e?.error?.message ||
          'Erro ao listar despesas. Ajuste os filtros e tente novamente.';
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
      formaPagamento: '',
      statusPagamento: '',
      recorrente: false,
      notificarAntesVencimento: null,
      observacoes: '',
    });
    this.success = null;
    this.error = null;
  }

  edit(item: DespesaResponse): void {
    this.editingId = item.id;
    this.form.setValue({
      descricao: item.descricao,
      categoria: item.categoria,
      valor: item.valor,
      data: item.data,
      formaPagamento: item.formaPagamento,
      statusPagamento: item.statusPagamento,
      recorrente: item.recorrente ?? false,
      notificarAntesVencimento: item.notificarAntesVencimento ?? null,
      observacoes: item.observacoes ?? '',
    });
    this.success = null;
    this.error = null;
  }

  remove(item: DespesaResponse): void {
    if (!confirm('Confirma a exclusão desta despesa?')) return;
    this.loading = true;
    this.api.delete(item.id).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Despesa removida com sucesso.';
        this.load();
      },
      error: (e) => {
        this.loading = false;
        this.error =
          e?.error?.message || 'Falha ao remover a despesa. Tente novamente.';
      },
    });
  }

  save(): void {
    if (this.form.invalid) return;
    const payload = this.form.getRawValue() as DespesaRequest;
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
          ? 'Despesa atualizada com sucesso.'
          : 'Despesa criada com sucesso.';
        if (this.editingId == null) {
          this.toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Despesa criada com sucesso.' });
        }
        this.resetForm();
        this.load();
      },
      error: (e) => {
        this.loading = false;
        this.error =
          e?.error?.message ||
          'Falha ao salvar a despesa. Verifique os campos e tente novamente.';
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
}
