import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { ForgotComponent } from './features/forgot/forgot.component';
import { AppLayout } from './layout/component/app.layout';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ReceitasComponent } from './features/receitas/receitas.component';
import { DespesasComponent } from './features/despesas/despesas.component';
import { RelatoriosComponent } from './features/relatorios/relatorios.component';
import { InvestimentosComponent } from './features/investimentos/investimentos.component';
import { MetasComponent } from './features/metas/metas.component';
import { AdminComponent } from './features/admin/admin.component';
import { AccountSettingsComponent } from './features/settings/account-settings.component';
import { EmailNotificationsComponent } from './features/settings/email-notifications.component';
import { CotacaoAlertsComponent } from './features/settings/cotacao-alerts.component';
import { SecuritySettingsComponent } from './features/settings/security-settings.component';
import { NotificationsHistoryComponent } from './features/settings/notifications-history.component';
import { HomeComponent } from './features/home/home.component';

import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

import { ContaComponent } from './features/conta/conta.component';
import { contaAccessGuard } from './guards/conta-access.guard';

export const routes: Routes = [
  // Public Routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'esqueci-senha', component: ForgotComponent },

  // Protected Layout Routes
  {
    path: '',
    component: AppLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'receitas', component: ReceitasComponent },
      { path: 'despesas', component: DespesasComponent },
      { path: 'relatorios', component: RelatoriosComponent },
      { path: 'investimentos', component: InvestimentosComponent },
      { path: 'metas', component: MetasComponent },
      { path: 'home', component: HomeComponent },
      
      // Restricted
      { path: 'conta', component: ContaComponent, canActivate: [contaAccessGuard] },
      
      // Admin
      { path: 'admin', component: AdminComponent, canActivate: [roleGuard] },

      // Settings
      { path: 'config/conta', component: AccountSettingsComponent },
      { path: 'config/notificacoes-email', component: EmailNotificationsComponent },
      { path: 'config/alertas-cotacao', component: CotacaoAlertsComponent },
      { path: 'config/seguranca', component: SecuritySettingsComponent },
      { path: 'config/historico-notificacoes', component: NotificationsHistoryComponent },
    ]
  },

  // Fallback
  { path: '**', redirectTo: 'login' },
];

