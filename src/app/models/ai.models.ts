export interface AiAssistantRequestDTO {
  message: string;
  context?: {
    saldoAtual?: string | number;
    receitas?: string | number;
    despesas?: string | number;
    [key: string]: any;
  };
}

export interface AiAssistantResponseDTO {
  response: string;
}
