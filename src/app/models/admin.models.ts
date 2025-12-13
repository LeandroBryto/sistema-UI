export interface AdminUserResponseDTO {
  id: number;
  username: string;
  email: string;
  status: 'ATIVO' | 'BLOQUEADO';
  role: 'ADMIN' | 'USER';
  dataCadastro: string;
  ultimaAtualizacao: string;
}

export interface MetricsSummaryDTO {
  totalUsuarios: number;
  usuariosAtivos: number;
  administradores: number;
}

export interface AuditLogResponseDTO {
  id: number;
  adminUsername: string;
  userId: number;
  action: string;
  timestamp: string;
  details?: string;
}

export interface ApplicationStatusDTO {
  status: 'UP' | 'DOWN' | string;
  timestamp: string;
}

