export type TipoCategoria = 'RECEITA' | 'DESPESA';

export interface CategoriaRequest {
  nome: string;
  tipo: TipoCategoria;
  icone: string;
  cor: string;
}

export interface CategoriaResponse extends CategoriaRequest {
  id: number;
  usuarioId: number;
}
