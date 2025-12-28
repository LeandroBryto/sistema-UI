export interface LoginPayload {
  username: string;
  senha: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  telefone: string;
  senha: string;
}

export interface PasswordResetPayload {
  email: string;
  novaSenha: string;
  confirmarSenha: string;
}

export interface ForgotPasswordRequestDTO {
  email: string;
}

export interface ChangePasswordPayload {
  senhaAtual: string;
  novaSenha: string;
  confirmaSenha: string;
}

