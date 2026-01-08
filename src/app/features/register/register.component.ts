import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InputTextModule, PasswordModule, ButtonModule, MessageModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  loading = false;
  success = false;
  error: string | null = null;

  form = this.fb.nonNullable.group({
    nomeCompleto: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    username: ['', [Validators.required]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    confirmSenha: ['', [Validators.required]],
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.form.invalid || this.loading) return;
    this.success = false;
    this.error = null;
    this.loading = true;

    const raw = this.form.getRawValue();
    if (raw.senha !== raw.confirmSenha) {
      this.loading = false;
      this.error = 'Senhas não coincidem.';
      return;
    }
    const payload = {
      nomeCompleto: raw.nomeCompleto,
      email: raw.email,
      username: raw.username,
      senha: raw.senha,
    };

    this.auth.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        const plano = this.auth.getPlano();
        if (plano === 'PREMIUM') {
          this.router.navigateByUrl('/dashboard');
        } else {
          this.router.navigateByUrl('/estudos');
        }
      },
      error: (e) => {
        this.loading = false;
        if (e?.status === 400) {
          this.error = e?.error?.message || 'Dados inválidos. Verifique os campos e tente novamente.';
        } else if (e?.status === 409) {
          this.error = 'Usuário ou e-mail já cadastrado.';
        } else {
          this.error = 'Falha ao registrar. Tente novamente mais tarde.';
        }
      },
    });
  }
}
