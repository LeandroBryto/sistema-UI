import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { HomeComponent } from './features/home/home.component';
import { RegisterComponent } from './features/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { DespesasComponent } from './features/despesas/despesas.component';
import { authGuard } from './guards/auth.guard';
import { ReceitasComponent } from './features/receitas/receitas.component';
import { RelatoriosComponent } from './features/relatorios/relatorios.component';
import { MetasComponent } from './features/metas/metas.component';
import { ForgotComponent } from './features/forgot/forgot.component';
import { AdminComponent } from './features/admin/admin.component';
import { roleGuard } from './guards/role.guard';
import { AccountSettingsComponent } from './features/settings/account-settings.component';
import { EmailNotificationsComponent } from './features/settings/email-notifications.component';
import { CotacaoAlertsComponent } from './features/settings/cotacao-alerts.component';
import { SecuritySettingsComponent } from './features/settings/security-settings.component';
import { NotificationsHistoryComponent } from './features/settings/notifications-history.component';
import { InvestimentosComponent } from './features/investimentos/investimentos.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'esqueci-senha', component: ForgotComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'despesas', component: DespesasComponent, canActivate: [authGuard] },
  { path: 'receitas', component: ReceitasComponent, canActivate: [authGuard] },
  { path: 'relatorios', component: RelatoriosComponent, canActivate: [authGuard] },
  { path: 'metas', component: MetasComponent, canActivate: [authGuard] },
  { path: 'investimentos', component: InvestimentosComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard, roleGuard] },
  { path: 'config/conta', component: AccountSettingsComponent, canActivate: [authGuard] },
  { path: 'config/notificacoes-email', component: EmailNotificationsComponent, canActivate: [authGuard] },
  { path: 'config/alertas-cotacao', component: CotacaoAlertsComponent, canActivate: [authGuard] },
  { path: 'config/seguranca', component: SecuritySettingsComponent, canActivate: [authGuard] },
  { path: 'config/historico-notificacoes', component: NotificationsHistoryComponent, canActivate: [authGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
