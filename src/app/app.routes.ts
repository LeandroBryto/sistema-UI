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

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'despesas', component: DespesasComponent, canActivate: [authGuard] },
  { path: 'receitas', component: ReceitasComponent, canActivate: [authGuard] },
  { path: 'relatorios', component: RelatoriosComponent, canActivate: [authGuard] },
  { path: 'metas', component: MetasComponent, canActivate: [authGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
