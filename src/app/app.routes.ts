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
import { FinancialAlertsComponent } from './features/settings/financial-alerts.component';
import { SecuritySettingsComponent } from './features/settings/security-settings.component';
import { NotificationsHistoryComponent } from './features/settings/notifications-history.component';
import { HomeComponent } from './features/home/home.component';

import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { planoGuard } from './guards/plano.guard';

import { ContaComponent } from './features/conta/conta.component';
import { contaAccessGuard } from './guards/conta-access.guard';
import { DashboardComponent as SistemaEstudosDashboardComponent } from './sistema-estudos/dashboard/dashboard.component';
import { CronogramaComponent } from './sistema-estudos/cronograma/cronograma.component';
import { MateriasComponent } from './sistema-estudos/materias/materias.component';
import { ModoFocoComponent } from './sistema-estudos/modo-foco/modo-foco.component';
import { FlashcardsComponent } from './sistema-estudos/flashcards/flashcards.component';
import { AgendaComponent } from './sistema-estudos/agenda/agenda.component';
import { PerfilComponent } from './sistema-estudos/perfil/perfil.component';
import { TarefasComponent } from './sistema-estudos/tarefas/tarefas.component';
import { CertificadosComponent } from './sistema-estudos/certificados/certificados.component';
import { LojaComponent } from './sistema-estudos/loja/loja.component';

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
      { path: 'dashboard', component: DashboardComponent, canActivate: [planoGuard] },
      { path: 'receitas', component: ReceitasComponent, canActivate: [planoGuard] },
      { path: 'despesas', component: DespesasComponent, canActivate: [planoGuard] },
      { path: 'relatorios', component: RelatoriosComponent, canActivate: [planoGuard] },
      { path: 'investimentos', component: InvestimentosComponent, canActivate: [planoGuard] },
      { path: 'metas', component: MetasComponent, canActivate: [planoGuard] },
      { path: 'home', component: HomeComponent },
      { path: 'estudos', component: SistemaEstudosDashboardComponent },
      { path: 'estudos/materias', component: MateriasComponent },
      { path: 'estudos/modo-foco', component: ModoFocoComponent },
      { path: 'estudos/flashcards', component: FlashcardsComponent },
      { path: 'estudos/agenda', component: AgendaComponent },
      { path: 'estudos/perfil', component: PerfilComponent },
      { path: 'estudos/cronograma', component: CronogramaComponent },
      { path: 'estudos/tarefas', component: TarefasComponent },
      { path: 'estudos/certificados', component: CertificadosComponent },
      { path: 'estudos/loja', component: LojaComponent },
      
      // Restricted
      { path: 'conta', component: ContaComponent, canActivate: [contaAccessGuard] },
      
      // Admin
      { path: 'admin', component: AdminComponent, canActivate: [roleGuard] },

      // Settings
      { path: 'config/conta', component: AccountSettingsComponent },
      { path: 'config/notificacoes-email', component: EmailNotificationsComponent },
      { path: 'config/alertas-cotacao', component: CotacaoAlertsComponent, canActivate: [planoGuard] },
      { path: 'config/alertas-financeiros', component: FinancialAlertsComponent, canActivate: [planoGuard] },
      { path: 'config/seguranca', component: SecuritySettingsComponent },
      { path: 'config/historico-notificacoes', component: NotificationsHistoryComponent },
    ]
  },

  // Fallback
  { path: '**', redirectTo: 'login' },
];

