import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PasswordResetPayload } from '../../models/auth.models';

@Component({
  selector: 'app-forgot',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.css'],
})
export class ForgotComponent {
  loading = false;
  success: string | null = null;
  error: string | null = null;
  fieldErrors: { email?: string; novaSenha?: string; confirmarSenha?: string } = {};

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    novaSenha: ['', [Validators.required, Validators.minLength(6)]],
    confirmarSenha: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    this.success = null;
    this.error = null;
    this.fieldErrors = {};
    const { novaSenha, confirmarSenha } = this.form.getRawValue();
    if (novaSenha !== confirmarSenha) {
      this.loading = false;
      this.fieldErrors.confirmarSenha = 'Nova senha e confirmação não conferem.';
      return;
    }
    const payload = this.form.getRawValue() as PasswordResetPayload;
    this.auth.resetPassword(payload).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Senha atualizada com sucesso.';
        this.router.navigateByUrl('/');
      },
      error: (e) => {
        this.loading = false;
        if (e?.status === 0) {
          this.error = 'Falha de rede ou CORS. Verifique sua conexão.';
          return;
        }
        if (e?.status === 404) {
          this.error = 'Usuário não encontrado';
          return;
        }
        if (e?.status === 500) {
          this.error = 'Nova senha e confirmação não conferem.';
          return;
        }
        if (e?.status === 400) {
          this.mapValidationErrors(e?.error);
          this.error = e?.error?.message || 'Verifique os campos informados.';
          return;
        }
        this.error = e?.error?.message || 'Falha ao resetar a senha.';
      },
    });
  }

  passwordsMismatch(): boolean {
    const { novaSenha, confirmarSenha } = this.form.getRawValue();
    return !!novaSenha && !!confirmarSenha && novaSenha !== confirmarSenha;
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
      ['email', 'novaSenha', 'confirmarSenha'].forEach((k) => {
        const v = body?.[k];
        if (typeof v === 'string') fieldErrs[k] = v;
      });
    }
    this.fieldErrors = {
      email: fieldErrs['email'],
      novaSenha: fieldErrs['novaSenha'],
      confirmarSenha: fieldErrs['confirmarSenha'],
    };
  }
}
