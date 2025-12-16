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
import { InputMaskModule } from 'primeng/inputmask';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InputTextModule, PasswordModule, InputMaskModule, ButtonModule, MessageModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  loading = false;
  success = false;
  error: string | null = null;

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    username: ['', [Validators.required]],
    telefone: ['', [Validators.required]],
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
      email: raw.email,
      username: raw.username,
      telefone: (raw.telefone || '').replace(/\D/g, ''),
      senha: raw.senha,
    };

    this.auth.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        this.router.navigateByUrl('/');
      },
      error: (e) => {
        this.loading = false;
        this.error =
          e?.error?.message ||
          'Falha ao registrar. Verifique os dados e tente novamente.';
      },
    });
  }
}
