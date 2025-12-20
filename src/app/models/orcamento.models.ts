export interface OrcamentoRequest {
  idCategoria: number;
  limiteMensal: number;
  limiteAlerta: number;
  mes: number;
  ano: number;
}

export interface OrcamentoResponse extends OrcamentoRequest {
  id: number;
  totalGasto: number;
  progressoPercentual: number;
}
