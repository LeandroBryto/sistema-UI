export interface CotacaoDia {
  dataCotacao: string;
  valor: number;
}

export interface CotacaoAtualResponse {
  atual: CotacaoDia;
  anterior: CotacaoDia;
  variacaoPercentual: number;
  tendencia: 'ALTA' | 'BAIXA' | 'ESTAVEL';
  recomendacao: string;
  fallback: boolean;
}
