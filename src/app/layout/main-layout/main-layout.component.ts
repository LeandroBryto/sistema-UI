import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    PanelMenuModule,
    AvatarModule,
    ButtonModule,
    InputTextModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  menuItems: MenuItem[] = [];

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.menuItems = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        routerLink: '/dashboard',
        command: () => this.onMenuClick()
      },
      {
        label: 'Receitas',
        icon: 'pi pi-wallet',
        routerLink: '/receitas',
        command: () => this.onMenuClick()
      },
      {
        label: 'Despesas',
        icon: 'pi pi-credit-card',
        routerLink: '/despesas',
        command: () => this.onMenuClick()
      },
      {
        label: 'Investimentos',
        icon: 'pi pi-chart-line',
        routerLink: '/investimentos',
        command: () => this.onMenuClick()
      },
      {
        label: 'Relatórios',
        icon: 'pi pi-file',
        routerLink: '/relatorios',
        command: () => this.onMenuClick()
      },
      {
        label: 'Configurações',
        icon: 'pi pi-cog',
        routerLink: '/config/conta',
        command: () => this.onMenuClick()
      }
    ];

    if (this.auth.isAdmin()) {
      this.menuItems.push({
        label: 'Painel de Controle',
        icon: 'pi pi-shield',
        routerLink: '/admin',
        command: () => this.onMenuClick(),
        styleClass: 'admin-menu-item'
      });
    }

    this.menuItems.push({
      label: 'Sair',
      icon: 'pi pi-power-off',
      command: () => this.logout()
    });
  }

  username(): string | null {
    return this.auth.getUsername();
  }

  sidebarActive = false;

  toggleSidebar() {
    this.sidebarActive = !this.sidebarActive;
  }

  onMenuClick() {
    this.sidebarActive = false;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
