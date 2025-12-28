export interface GoalRequest {
  meta: string;
  descricao?: string;
  valorMeta: number;
  valorAcumulado?: number;
  previsaoConclusao?: string;
}

export interface GoalResponse {
  id: number;
  meta: string;
  descricao: string;
  valorMeta: number;
  valorAcumulado: number;
  percentualConcluido: number;
  previsaoConclusao: string;
}

export interface CotacaoDolarDTO {
  data: string;
  valor: number;
}

