export interface DespesaRequest {
  descricao: string;
  categoria: string;
  valor: number;
  data: string;
  formaPagamento: string;
  recorrente?: boolean;
  notificarAntesVencimento?: number;
  statusPagamento: string;
  observacoes?: string;
}

export interface DespesaResponse extends DespesaRequest {
  id: number;
}

