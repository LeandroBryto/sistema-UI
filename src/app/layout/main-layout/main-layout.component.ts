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
        label: 'PRINCIPAL',
        expanded: true,
        items: [
          {
            label: 'Dashboard',
            icon: 'pi pi-fw pi-home',
            routerLink: '/dashboard',
            command: () => this.onMenuClick()
          }
        ]
      },
      {
        label: 'GESTÃO',
        expanded: true,
        items: [
          {
            label: 'Receitas',
            icon: 'pi pi-fw pi-wallet',
            routerLink: '/receitas',
            command: () => this.onMenuClick()
          },
          {
            label: 'Despesas',
            icon: 'pi pi-fw pi-credit-card',
            routerLink: '/despesas',
            command: () => this.onMenuClick()
          },
          {
            label: 'Investimentos',
            icon: 'pi pi-fw pi-chart-line',
            routerLink: '/investimentos',
            command: () => this.onMenuClick()
          }
        ]
      },
      {
        label: 'ANÁLISES',
        expanded: true,
        items: [
          {
            label: 'Relatórios',
            icon: 'pi pi-fw pi-file',
            routerLink: '/relatorios',
            command: () => this.onMenuClick()
          }
        ]
      },
      {
        label: 'SISTEMA',
        expanded: true,
        items: [
          {
            label: 'Configurações',
            icon: 'pi pi-fw pi-cog',
            routerLink: '/config/conta',
            command: () => this.onMenuClick()
          }
        ]
      }
    ];

    if (this.auth.isAdmin()) {
      // Find the 'SISTEMA' group and add Admin
      const sistemaGroup = this.menuItems.find(item => item.label === 'SISTEMA');
      if (sistemaGroup && sistemaGroup.items) {
        sistemaGroup.items.splice(1, 0, {
          label: 'Painel de Controle',
          icon: 'pi pi-fw pi-shield',
          routerLink: '/admin',
          command: () => this.onMenuClick(),
          styleClass: 'admin-menu-item'
        });
      }
    }

    // Add Logout to SISTEMA
    const sistemaGroup = this.menuItems.find(item => item.label === 'SISTEMA');
    if (sistemaGroup && sistemaGroup.items) {
      sistemaGroup.items.push({
        label: 'Sair',
        icon: 'pi pi-fw pi-power-off',
        command: () => this.logout()
      });
    }
  }

  username(): string | null {
    return this.auth.getUsername();
  }

  sidebarActive = false;

  checkScreenSize() {
    if (window.innerWidth >= 992) {
      this.sidebarActive = true; // Desktop starts expanded
    } else {
      this.sidebarActive = false; // Mobile starts hidden
    }
  }

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
