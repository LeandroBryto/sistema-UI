import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InputTextModule, PasswordModule, ButtonModule, CheckboxModule, MessageModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loading = false;
  error: string | null = null;

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    senha: ['', [Validators.required]],
    rememberMe: [false]
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.form.invalid || this.loading) return;
    this.error = null;
    this.loading = true;

    const { username, senha } = this.form.getRawValue();

    this.auth.login({ username, senha }).subscribe({
      next: () => {
        this.loading = false;
        const plano = this.auth.getPlano();
        if (plano === 'PREMIUM') {
          this.router.navigateByUrl('/dashboard');
        } else {
          this.router.navigateByUrl('/estudos');
        }
      },
      error: (e) => {
        this.loading = false;
        if (e?.status === 401) {
          this.error = 'Credenciais inválidas. Verifique seu username e senha.';
        } else if (e?.status === 403) {
          this.error = 'Acesso negado. Sua conta pode estar bloqueada.';
        } else if (e?.status === 400) {
          this.error = 'Dados inválidos. Verifique os campos.';
        } else {
          this.error = 'Falha ao entrar. Tente novamente mais tarde.';
        }
      },
    });
  }
}
