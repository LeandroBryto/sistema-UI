import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-security-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './security-settings.component.html',
  styleUrls: ['./settings.common.css'],
})
export class SecuritySettingsComponent {
  form = this.fb.nonNullable.group({
    alertaLogin: [false],
    alertaResetSenha: [true],
  });
  saving = false;
  saved = false;
  constructor(private fb: FormBuilder) {}
  save(): void {
    this.saving = true;
    setTimeout(() => { this.saving = false; this.saved = true; }, 800);
  }
}

