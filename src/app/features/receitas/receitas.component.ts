import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import {
  ReceitaService,
  ReceitaRequest,
  ReceitaResponse,
} from '../../services/receita.service';

@Component({
  selector: 'app-receitas',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './receitas.component.html',
  styleUrls: ['./receitas.component.css'],
})
export class ReceitasComponent {
  loading = false;
  error: string | null = null;
  success: string | null = null;
  itens: ReceitaResponse[] = [];
  editingId: number | null = null;

  filtros = this.fb.nonNullable.group({
    startDate: [''],
    endDate: [''],
  });

  form = this.fb.nonNullable.group({
    descricao: ['', [Validators.required]],
    categoria: ['', [Validators.required]],
    valor: [0, [Validators.required, Validators.min(0.01)]],
    data: ['', [Validators.required]],
    formaRecebimento: ['', [Validators.required]],
    recorrente: [false],
    observacoes: [''],
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

  constructor(private fb: FormBuilder, private api: ReceitaService) {
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
          'Erro ao listar receitas. Ajuste os filtros e tente novamente.';
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
    });
    this.success = null;
    this.error = null;
  }

  remove(item: ReceitaResponse): void {
    if (!confirm('Confirma a exclusão desta receita?')) return;
    this.loading = true;
    this.api.delete(item.id).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Receita removida com sucesso.';
        this.load();
      },
      error: (e) => {
        this.loading = false;
        this.error =
          e?.error?.message || 'Falha ao remover a receita. Tente novamente.';
      },
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
        this.resetForm();
        this.load();
      },
      error: (e) => {
        this.loading = false;
        this.error =
          e?.error?.message ||
          'Falha ao salvar a receita. Verifique os campos e tente novamente.';
      },
    });
  }
}
