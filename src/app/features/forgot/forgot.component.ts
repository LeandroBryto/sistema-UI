import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../services/auth.service';
import { ForgotPasswordRequestDTO } from '../../models/auth.models';

@Component({
  selector: 'app-forgot',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule, MessageModule],
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.css'],
})
export class ForgotComponent {
  loading = false;
  success: string | null = null;
  error: string | null = null;
  fieldErrors: { email?: string; senhaTemporaria?: string; novaSenha?: string } = {};
  cooldownUntil = 0;
  cooldownMs = 12000;
  mode: 'forgot' | 'reset' = 'forgot';

  forgotForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  resetForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senhaTemporaria: ['', [Validators.required]],
    novaSenha: ['', [Validators.required, Validators.minLength(6)]],
    confirmNovaSenha: ['', [Validators.required]],
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  onForgotSubmit(): void {
    if (this.forgotForm.invalid || this.loading || this.inCooldown()) return;
    this.loading = true;
    this.success = null;
    this.error = null;
    this.fieldErrors = {};
    const payload = this.forgotForm.getRawValue() as ForgotPasswordRequestDTO;
    this.auth.forgotPassword(payload).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Senha temporária enviada para seu e-mail.';
        this.startCooldown();
      },
      error: (e) => {
        this.loading = false;
        if (e?.status === 0) {
          this.error = 'Falha de rede ou CORS. Verifique sua conexão.';
          return;
        }
        if (e?.status === 404) {
          this.error = 'E-mail não encontrado.';
          return;
        }
        if (e?.status === 500) {
          this.error = 'Falha ao enviar e-mail. Tente novamente.';
          return;
        }
        if (e?.status === 400) {
          this.mapValidationErrors(e?.error);
          this.error = e?.error?.message || 'Verifique os campos informados.';
          return;
        }
        this.error = e?.error?.message || 'Falha ao recuperar a senha.';
      },
    });
  }

  onResetSubmit(): void {
    if (this.resetForm.invalid || this.loading) return;
    this.success = null;
    this.error = null;
    this.fieldErrors = {};
    this.loading = true;

    const raw = this.resetForm.getRawValue();
    if (raw.novaSenha !== raw.confirmNovaSenha) {
      this.loading = false;
      this.error = 'Senhas não coincidem.';
      return;
    }
    const payload = {
      email: raw.email,
      senhaTemporaria: raw.senhaTemporaria,
      novaSenha: raw.novaSenha,
    };

    this.auth.resetPassword(payload).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Senha redefinida com sucesso. Você pode fazer login agora.';
        this.mode = 'forgot';
        this.resetForm.reset();
      },
      error: (e) => {
        this.loading = false;
        if (e?.status === 400) {
          this.error = e?.error?.message || 'Dados inválidos. Verifique a senha temporária.';
        } else if (e?.status === 404) {
          this.error = 'E-mail não encontrado ou senha temporária inválida.';
        } else {
          this.error = 'Falha ao redefinir senha. Tente novamente.';
        }
      },
    });
  }

  toggleMode(): void {
    this.mode = this.mode === 'forgot' ? 'reset' : 'forgot';
    this.success = null;
    this.error = null;
    this.fieldErrors = {};
  }

  inCooldown(): boolean {
    return Date.now() < this.cooldownUntil;
  }
  startCooldown(): void {
    this.cooldownUntil = Date.now() + this.cooldownMs;
    setTimeout(() => {
      this.cooldownUntil = 0;
    }, this.cooldownMs);
  }

  private mapValidationErrors(body: any): void {
    const fieldErrs: { [k: string]: string } = {};
    if (!body) {
      this.fieldErrors = {};
      return;
    }
    if (Array.isArray(body?.errors)) {
      for (const it of body.errors) {
        const field = it?.field || it?.propertyPath || it?.fieldName;
        const msg = it?.defaultMessage || it?.message || it?.reason;
        if (field && msg) fieldErrs[field] = msg;
      }
    } else if (body?.fieldErrors && typeof body.fieldErrors === 'object') {
      for (const k of Object.keys(body.fieldErrors)) {
        const v = body.fieldErrors[k];
        if (typeof v === 'string') fieldErrs[k] = v;
        else if (Array.isArray(v) && v.length) fieldErrs[k] = String(v[0]);
      }
    } else {
      ['email', 'senhaTemporaria', 'novaSenha'].forEach((k) => {
        const v = body?.[k];
        if (typeof v === 'string') fieldErrs[k] = v;
      });
    }
    this.fieldErrors = {
      email: fieldErrs['email'],
      senhaTemporaria: fieldErrs['senhaTemporaria'],
      novaSenha: fieldErrs['novaSenha']
    };
  }
}
