export interface GoalRequest {
  meta: string;
  valorMeta: number;
  valorAcumulado?: number;
}

export interface GoalResponse {
  id: number;
  meta: string;
  valorMeta: number;
  valorAcumulado: number;
  dataCriacao: string;
  previsaoConclusao: string;
  percentualConcluido: number;
}

export interface CotacaoDolarDTO {
  data: string;
  valor: number;
}

