export interface CartaoCreditoRequest {
  nome: string;
  idCarteira: number;
  limite: number;
  diaFechamento: number;
  diaVencimento: number;
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
