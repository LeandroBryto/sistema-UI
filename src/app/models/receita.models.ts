export interface ReceitaRequest {
  descricao: string;
  categoria: string;
  valor: number;
  data: string;
  formaRecebimento: string;
  recorrente?: boolean;
  observacoes?: string;
  carteiraId?: number;
  categoriaId?: number;
}

export interface ReceitaResponse extends ReceitaRequest {
  id: number;
}

