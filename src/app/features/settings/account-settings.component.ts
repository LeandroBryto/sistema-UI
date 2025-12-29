import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TabViewModule } from 'primeng/tabview';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { ChangePasswordPayload } from '../../models/auth.models';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    PasswordModule,
    ButtonModule,
    ToastModule,
    TabViewModule,
    CardModule,
    InputTextModule
  ],
  providers: [MessageService],
  templateUrl: './account-settings.component.html',
  styleUrls: ['./settings.common.css'],
})
export class AccountSettingsComponent implements OnInit {
  securityForm: FormGroup;
  profileForm: FormGroup;

  constructor(private fb: FormBuilder, private toast: MessageService, private authService: AuthService) {
    this.securityForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });

    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['']
    });
  }

  ngOnInit(): void {
    // Carregar dados do perfil se disponível
    // this.loadProfile();
  }

  passwordMatchValidator(group: FormGroup): any {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  changePassword(): void {
    if (this.securityForm.valid) {
      const payload: ChangePasswordPayload = {
        senhaAtual: this.securityForm.get('currentPassword')?.value,
        novaSenha: this.securityForm.get('newPassword')?.value,
        confirmaSenha: this.securityForm.get('confirmPassword')?.value
      };
      this.authService.changePassword(payload).subscribe({
        next: () => {
          this.toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Senha alterada com sucesso!' });
          this.securityForm.reset();
        },
        error: (err) => {
          this.toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao alterar senha. Verifique os dados.' });
        }
      });
    } else {
      this.toast.add({ severity: 'error', summary: 'Erro', detail: 'Preencha todos os campos corretamente.' });
    }
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      // Implementar lógica para atualizar perfil
      this.toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Perfil atualizado com sucesso!' });
    } else {
      this.toast.add({ severity: 'error', summary: 'Erro', detail: 'Preencha todos os campos corretamente.' });
    }
  }
}

