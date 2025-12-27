import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';

// Services
import { DespesaService } from '../../services/despesa.service';
import { CarteiraService } from '../../services/carteira.service';
import { CartaoService } from '../../services/cartao.service';
import { CategoriaService } from '../../services/categoria.service';

// Models
import { DespesaRequest, DespesaResponse } from '../../models/despesa.models';
import { CarteiraResponse } from '../../models/carteira.models';
import { CartaoCreditoResponse } from '../../models/cartao.models';
import { CategoriaResponse } from '../../models/categoria.models';
import { CATEGORIAS_DESPESA } from '../../models/categorias.models';
import { FORMAS_PAGAMENTO, STATUS_DESPESA_FORM, STATUS_DESPESA_FILTER } from '../../models/despesas.constants';

// PrimeNG
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
export class DespesasComponent implements OnInit {
  loading = false;
  error: string | null = null;
  success: string | null = null;
  
  // Lista principal
  itens: DespesaResponse[] = [];
  editingId: number | null = null;
  globalFilter = '';

  // Listas auxiliares (Dropdowns)
  carteiras: CarteiraResponse[] = [];
  cartoes: CartaoCreditoResponse[] = [];
  categoriasPersonalizadas: CategoriaResponse[] = [];

  // Constantes
  categorias = CATEGORIAS_DESPESA;
  formas = FORMAS_PAGAMENTO;
  statusForm = STATUS_DESPESA_FORM;
  statusFilter = STATUS_DESPESA_FILTER;

  // Filtros de Data
  filtros = this.fb.nonNullable.group({
    startDate: [''],
    endDate: [''],
  });

  // Formulário Principal
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
    
    // Campos Relacionais
    carteiraId: [null as number | null],
    cartaoCreditoId: [null as number | null],
    categoriaId: [null as number | null]
  });
  constructor(
    private fb: FormBuilder, 
    private api: DespesaService, 
    private toast: MessageService,
    private carteiraService: CarteiraService,
    private cartaoService: CartaoService,
    private categoriaService: CategoriaService
  ) {
    const { start, end } = this.currentMonthRange();
    this.filtros.setValue({ startDate: start, endDate: end });
  }

  ngOnInit(): void {
    this.load();
    this.loadAuxiliares();
    this.setupAutoClear(); // Inicia o listener do formulário
  }

  // --- LÓGICA REATIVA DO FORMULÁRIO ---
  setupAutoClear(): void {
    this.form.controls.formaPagamento.valueChanges.subscribe(forma => {
      const carteiraCtrl = this.form.controls.carteiraId;
      const cartaoCtrl = this.form.controls.cartaoCreditoId;

      // Reset básico dos validadores
      carteiraCtrl.clearValidators();
      cartaoCtrl.clearValidators();

      if (forma === 'CARTAO_CREDITO') {
        // Regra: Crédito exige Cartão, Carteira é opcional/nula
        cartaoCtrl.setValidators([Validators.required]);
        this.form.patchValue({ carteiraId: null }); 
        
        // Sugestão de UX: Se é crédito, geralmente nasce Pendente (vai pra fatura)
        if (!this.editingId) this.form.controls.statusPagamento.setValue('PENDENTE');

      } else if (['PIX', 'DINHEIRO', 'CARTAO_DEBITO'].includes(forma)) {
        // Regra: Débito/Pix exige Carteira, Cartão deve ser nulo
        carteiraCtrl.setValidators([Validators.required]);
        this.form.patchValue({ cartaoCreditoId: null });
        
        // Sugestão de UX: Se é Pix/Débito, nasce Pago
        if (!this.editingId) this.form.controls.statusPagamento.setValue('PAGO');
      } else {
        // Outros: Limpa ambos
        this.form.patchValue({ carteiraId: null, cartaoCreditoId: null });
      }

      carteiraCtrl.updateValueAndValidity();
      cartaoCtrl.updateValueAndValidity();
    });
  }

  // --- CARREGAMENTO DE DADOS ---
  loadAuxiliares(): void {
    this.carteiraService.list().subscribe(l => this.carteiras = l);
    this.cartaoService.list().subscribe(l => this.cartoes = l);
    this.categoriaService.list().subscribe(l => this.categoriasPersonalizadas = l.filter(c => c.tipo === 'DESPESA'));
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
        this.error = e?.error?.message || 'Erro ao listar despesas.';
        this.toast.add({ severity: 'error', summary: 'Erro', detail: this.error! });
      },
    });
  }

  // --- AÇÕES DO FORMULÁRIO ---
  resetForm(): void {
    this.editingId = null;
    this.form.reset({
      valor: 0,
      recorrente: false,
      statusPagamento: 'PENDENTE' // Default seguro
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
      
      carteiraId: item.carteiraId ?? null,
      
      // Aqui usamos o ID. Se o cartão foi deletado, isso virá null do backend
      // O usuário verá o select vazio, o que é correto para edição
      cartaoCreditoId: item.cartaoId ?? null, 
      
      categoriaId: item.categoriaId ?? null
    });
    this.success = null;
    this.error = null;
  }

  save(): void {
    if (this.form.invalid) {
        // Dica: Marca todos como touched para exibir os erros na tela
        this.form.markAllAsTouched(); 
        return;
    }

    const raw = this.form.getRawValue();
    
    // Construção do Payload Limpo
    const payload: DespesaRequest = {
      descricao: (raw.descricao || '').trim(),
      categoria: raw.categoria,
      valor: Number(raw.valor),
      data: raw.data,
      formaPagamento: raw.formaPagamento,
      statusPagamento: raw.statusPagamento,
      recorrente: !!raw.recorrente,
      notificarAntesVencimento: raw.notificarAntesVencimento ?? null,
      observacoes: raw.observacoes?.trim() || undefined,
      categoriaId: raw.categoriaId ?? undefined,
      
      // Lógica de envio condicional
      // Se for CRÉDITO, manda o cartão e ignora carteira
      cartaoCreditoId: raw.formaPagamento === 'CARTAO_CREDITO' ? (raw.cartaoCreditoId ?? undefined) : undefined,
      
      // Se for PIX/DEBITO, manda a carteira e ignora cartão
      carteiraId: ['PIX', 'DINHEIRO', 'CARTAO_DEBITO'].includes(raw.formaPagamento) ? (raw.carteiraId ?? undefined) : undefined
    };

    this.loading = true;
    
    const req$ = this.editingId != null
        ? this.api.update(this.editingId, payload)
        : this.api.create(payload);

    req$.subscribe({
      next: () => {
        this.loading = false;
        const msg = this.editingId ? 'Despesa atualizada!' : 'Despesa criada!';
        this.toast.add({ severity: 'success', summary: 'Sucesso', detail: msg });
        this.resetForm();
        this.load();
      },
      error: (e) => {
        this.loading = false;
        this.error = e?.error?.message || 'Falha ao salvar.';
        this.toast.add({ severity: 'error', summary: 'Erro', detail: this.error! });
      },
    });
  }

  remove(item: DespesaResponse): void {
    if (!confirm('Confirma a exclusão desta despesa?')) return;
    this.loading = true;
    this.api.delete(item.id).subscribe({
      next: () => {
        this.loading = false;
        this.toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Despesa removida.' });
        this.load();
      },
      error: (e) => {
        this.loading = false;
        this.toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao remover.' });
      },
    });
  }

  // --- HELPERS ---
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

  formaSeverity(f: string): 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'contrast' {
    switch (f) {
      case 'CARTAO_CREDITO': return 'info';
      case 'PIX': return 'contrast';
      case 'CARTAO_DEBITO': return 'success';
      case 'DINHEIRO': return 'secondary';
      default: return 'secondary';
    }
  }
}