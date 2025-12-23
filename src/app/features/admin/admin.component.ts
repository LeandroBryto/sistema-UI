import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { Router, RouterLink } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AdminUserResponseDTO, MetricsSummaryDTO, AuditLogResponseDTO, ApplicationStatusDTO } from '../../models/admin.models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, DropdownModule, ButtonModule, DialogModule, PasswordModule, ToastModule, TableModule, InputTextModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  providers: [MessageService],
})
export class AdminComponent implements OnInit {
  loading = false;
  error: string | null = null;
  users: AdminUserResponseDTO[] = [];
  metrics: MetricsSummaryDTO | null = null;
  last: AdminUserResponseDTO[] = [];
  audit: AuditLogResponseDTO[] = [];
  status: ApplicationStatusDTO | null = null;
  auditFiltered: AuditLogResponseDTO[] = [];
  showResetDialog = false;
  userToReset: AdminUserResponseDTO | null = null;
  resetForm = this.fb.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirm: ['', [Validators.required, Validators.minLength(6)]],
  });

  roleForm = this.fb.nonNullable.group({
    role: ['USER' as 'ADMIN' | 'USER', [Validators.required]],
  });

  filterForm = this.fb.nonNullable.group({
    action: ['ALL'],
    lastLimit: [10],
    auditLimit: [50],
  });

  constructor(private admin: AdminService, private fb: FormBuilder, private router: Router, private toast: MessageService) {}

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
        const { lastLimit, auditLimit } = this.filterForm.getRawValue();
        this.admin.lastLogins(lastLimit).subscribe({
          next: (l) => (this.last = [...l].sort((a, b) => new Date(b.ultimaAtualizacao).getTime() - new Date(a.ultimaAtualizacao).getTime())),
        });
        this.admin.audit(auditLimit).subscribe({
          next: (a) => {
            this.audit = [...a].sort((x, y) => new Date(y.timestamp).getTime() - new Date(x.timestamp).getTime());
            this.applyAuditFilter();
          },
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

  openResetDialog(u: AdminUserResponseDTO): void {
    this.userToReset = u;
    this.resetForm.reset({ password: '', confirm: '' });
    this.showResetDialog = true;
  }

  confirmReset(): void {
    if (!this.userToReset) return;
    const { password, confirm } = this.resetForm.getRawValue();
    if (!password || password.length < 6) return;
    if (password !== confirm) return;
    this.admin.resetPassword(this.userToReset.id, password).subscribe({
      next: () => {
        this.showResetDialog = false;
        this.userToReset = null;
        this.toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Senha alterada com sucesso.' });
        this.load();
      },
    });
  }

  closeResetDialog(): void {
    this.showResetDialog = false;
    this.userToReset = null;
  }

  goDashboard(): void {
    this.router.navigateByUrl('/dashboard');
  }

  formatDate(s: string | undefined | null): string {
    if (!s) return '—';
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const HH = String(d.getHours()).padStart(2, '0');
    const MM = String(d.getMinutes()).padStart(2, '0');
    const SS = String(d.getSeconds()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${HH}:${MM}:${SS}`;
  }

  actionClass(a: string | undefined | null): string {
    const x = (a || '').toUpperCase();
    if (x.includes('ACTIVATE')) return 'ok';
    if (x.includes('DEACTIVATE')) return 'warn';
    if (x.includes('RESET')) return 'info';
    if (x.includes('CHANGE') || x.includes('ROLE')) return 'info';
    return '';
  }

  applyAuditFilter(): void {
    const { action } = this.filterForm.getRawValue();
    const key = String(action || 'ALL').toUpperCase();
    this.auditFiltered = key === 'ALL' ? this.audit : this.audit.filter((x) => String(x.action || '').toUpperCase().includes(key));
  }

  refresh(): void {
    const { lastLimit, auditLimit } = this.filterForm.getRawValue();
    this.admin.lastLogins(lastLimit).subscribe({
      next: (l) => (this.last = [...l].sort((a, b) => new Date(b.ultimaAtualizacao).getTime() - new Date(a.ultimaAtualizacao).getTime())),
    });
    this.admin.audit(auditLimit).subscribe({
      next: (a) => {
        this.audit = [...a].sort((x, y) => new Date(y.timestamp).getTime() - new Date(x.timestamp).getTime());
        this.applyAuditFilter();
      },
    });
    this.admin.status().subscribe({ next: (s) => (this.status = s) });
  }

  refreshStatus(): void {
    this.admin.status().subscribe({ next: (s) => (this.status = s) });
  }
}
