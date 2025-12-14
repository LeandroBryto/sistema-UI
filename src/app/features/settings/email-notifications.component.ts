import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { EnvService } from '../../services/env.service';

@Component({
  selector: 'app-email-notifications',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './email-notifications.component.html',
  styleUrls: ['./settings.common.css'],
})
export class EmailNotificationsComponent implements OnInit {
  form = this.fb.nonNullable.group({
    enabled: [false],
    diarioCotacao: [false],
    variacaoPct: [false],
    semanalCotacao: [false],
  });
  saving = false;
  saved = false;
  error: string | null = null;

  constructor(private fb: FormBuilder, private http: HttpClient, private env: EnvService) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  private url(): string {
    return `${this.env.apiBase()}/api/v1/user/settings`;
  }

  private loadSettings(): void {
    this.error = null;
    this.http.get<{ emailAlertsEnabled: boolean }>(this.url()).subscribe({
      next: (res) => {
        const enabled = !!res.emailAlertsEnabled;
        this.form.patchValue({ enabled, diarioCotacao: enabled });
      },
      error: (e) => {
        this.error = e?.status === 401 ? 'Sessão expirada. Entre novamente.' : (e?.error?.message || 'Falha ao carregar preferências.');
      },
    });
  }
  save(): void {
    if (this.form.invalid || this.saving) return;
    this.saving = true;
    this.saved = false;
    this.error = null;
    const body = { emailAlertsEnabled: !!this.form.getRawValue().enabled };
    this.http.put<{ emailAlertsEnabled: boolean }>(this.url(), body).subscribe({
      next: (res) => {
        this.saving = false;
        this.saved = true;
        const enabled = !!res.emailAlertsEnabled;
        this.form.patchValue({ enabled, diarioCotacao: enabled });
      },
      error: (e) => {
        this.saving = false;
        this.error = e?.status === 401 ? 'Sessão expirada. Entre novamente.' : (e?.error?.message || 'Falha ao salvar preferências.');
      },
    });
  }
}
