export enum TipoItemLoja {
  AVATAR = 'AVATAR',
  TEMA_FUNDO = 'TEMA_FUNDO',
  SOM_AMBIENTE = 'SOM_AMBIENTE'
}

export interface ItemLojaDTO {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  tipo: TipoItemLoja;
  urlRecurso: string;
  adquirido: boolean;
}

export interface CompraRequestDTO {
  itemId: number;
}
