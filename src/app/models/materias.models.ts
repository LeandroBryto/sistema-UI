// Modelos específicos para a tela de Matérias

export interface MateriaEntity {
  id?: number;
  usuarioUsername: string;
  nome: string;
  corHex: string;
  icone: string;
  arquivada: boolean;
  dataCriacao?: Date;
}

export interface MateriaRequestDTO {
  nome: string;
  corHex: string;
  icone: string;
}

export interface MateriaResponseDTO {
  id: number;
  nome: string;
  corHex: string;
  icone: string;
  arquivada: boolean;
  dataCriacao?: Date;
}

export interface TopicoEntity {
  id?: number;
  nome: string;
  concluido: boolean;
  materiaId: number;
  ordem?: number;
  dataCriacao?: Date;
}

export interface TopicoRequestDTO {
  nome: string;
  materiaId: number;
}

export interface TopicoResponseDTO {
  id: number;
  nome: string;
  concluido: boolean;
  materiaId: number;
  ordem: number;
  dataCriacao: Date;
}

// Tipos auxiliares
export interface IconeOption {
  label: string;
  value: string;
}

export interface MateriaStats {
  totalMaterias: number;
  materiasAtivas: number;
  materiasArquivadas: number;
  limiteFree: number;
}