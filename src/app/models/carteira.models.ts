export type TipoCarteira = 'DINHEIRO' | 'CONTA_BANCARIA' | 'POUPANCA' | 'INVESTIMENTO' | 'OUTROS';

export interface CarteiraRequest {
  nome: string;
  tipo: TipoCarteira;
  saldoInicial: number;
}

export interface CarteiraResponse extends CarteiraRequest {
  id: number;
  saldoAtual: number;
}

export interface TransferenciaRequest {
  idCarteiraOrigem: number;
  idCarteiraDestino: number;
  valor: number;
  descricao: string;
}
