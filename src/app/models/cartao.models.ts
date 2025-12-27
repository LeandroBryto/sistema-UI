export interface CartaoCreditoRequest {
  nome: string;
  idCarteira?: number | null;
  limite: number;
  diaFechamento: number;
  diaVencimento: number;
  nomeCarteira?: string;
}

export interface CartaoCreditoResponse extends CartaoCreditoRequest {
  id: number;
}

export interface FaturaResponse {
  id: number;
  dataVencimento: string;
  dataFechamento: string;
  valorTotal: number;
  status: 'ABERTA' | 'FECHADA' | 'VENCIDA';
}
