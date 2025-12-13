export interface RelatorioMensalDTO {
  periodo: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  rankingReceitasPorCategoria?: Record<string, number>;
  rankingDespesasPorCategoria?: Record<string, number>;
  mediaGastosPorCategoria?: Record<string, number>;
  analiseAnomalias?: string;
}

export interface CarteiraFinanceiraDTO {
  saldoAtual: number;
  saldoPrevistoDoMes: number;
  percentualComprometido: number;
  saudeFinanceira: 'OK' | 'ATENCAO' | 'CRITICA';
  graficoReceitasVsDespesasJson: string;
}

export interface ResumoFinanceiroDTO {
  totalReceitas: number;
  totalDespesas: number;
  saldoAtual: number;
  saldoPrevisto: number;
  rankingMaioresDespesas?: Record<string, number>;
  sugestaoAutomatica?: string;
  saudeFinanceira: 'OK' | 'ATENCAO' | 'CRITICA';
}

