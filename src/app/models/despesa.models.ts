export interface DespesaRequest {
  descricao: string;
  categoria: string;
  valor: number;
  data: string;
  formaPagamento: string;
  recorrente?: boolean;
  notificarAntesVencimento?: number | null;
  statusPagamento: string;
  observacoes?: string;
  carteiraId?: number;
  cartaoCreditoId?: number;
  categoriaId?: number;
}

export interface DespesaResponse extends DespesaRequest {
  id: number;
}

