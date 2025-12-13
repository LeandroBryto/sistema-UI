import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { AdminUserResponseDTO, MetricsSummaryDTO, AuditLogResponseDTO, ApplicationStatusDTO } from '../../models/admin.models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  loading = false;
  error: string | null = null;
  users: AdminUserResponseDTO[] = [];
  metrics: MetricsSummaryDTO | null = null;
  last: AdminUserResponseDTO[] = [];
  audit: AuditLogResponseDTO[] = [];
  status: ApplicationStatusDTO | null = null;

  roleForm = this.fb.nonNullable.group({
    role: ['USER' as 'ADMIN' | 'USER', [Validators.required]],
  });

  constructor(private admin: AdminService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.users = [];
    this.metrics = null;
    this.last = [];
    this.audit = [];
    this.status = null;

    this.admin.listUsers().subscribe({
      next: (u) => {
        this.users = u;
        this.admin.metricsSummary().subscribe({
          next: (m) => {
            this.metrics = m;
          },
          error: (e) => {
            this.error = e?.error?.message || 'Erro ao carregar métricas';
          },
        });
        this.admin.lastLogins(10).subscribe({
          next: (l) => (this.last = l),
        });
        this.admin.audit(50).subscribe({
          next: (a) => (this.audit = a),
        });
        this.admin.status().subscribe({
          next: (s) => (this.status = s),
          complete: () => (this.loading = false),
          error: () => (this.loading = false),
        });
      },
      error: (e) => {
        this.loading = false;
        this.error =
          e?.status === 403
            ? 'Acesso negado (ADMIN apenas).'
            : e?.status === 401
            ? 'Sessão expirada. Faça login novamente.'
            : e?.error?.message || 'Erro ao carregar usuários.';
      },
    });
  }

  activate(u: AdminUserResponseDTO): void {
    this.admin.activateUser(u.id).subscribe({ next: () => this.load() });
  }

  deactivate(u: AdminUserResponseDTO): void {
    this.admin.deactivateUser(u.id).subscribe({ next: () => this.load() });
  }

  changeRole(u: AdminUserResponseDTO): void {
    const role = this.roleForm.getRawValue().role;
    this.admin.changeRole(u.id, role).subscribe({ next: () => this.load() });
  }

  resetPassword(u: AdminUserResponseDTO): void {
    const nova = prompt(`Nova senha para ${u.username}`) || '';
    if (!nova || nova.length < 6) return;
    this.admin.resetPassword(u.id, nova).subscribe({ next: () => this.load() });
  }
}
