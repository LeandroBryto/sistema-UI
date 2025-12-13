export interface ReceitaRequest {
  descricao: string;
  categoria: string;
  valor: number;
  data: string;
  formaRecebimento: string;
  recorrente?: boolean;
  observacoes?: string;
}

export interface ReceitaResponse extends ReceitaRequest {
  id: number;
}

