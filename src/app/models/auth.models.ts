export interface LoginPayload {
  username: string;
  senha: string;
}

export interface RegisterPayload {
  nomeCompleto: string;
  username: string;
  email: string;
  senha: string;
}

export interface PasswordResetPayload {
  email: string;
  senhaTemporaria: string;
  novaSenha: string;
}

export interface ForgotPasswordRequestDTO {
  email: string;
}

export interface ChangePasswordPayload {
  senhaAtual: string;
  novaSenha: string;
  confirmaSenha: string;
}

