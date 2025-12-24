import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from '../../services/auth.service';
import { PermissionService } from '../../services/permission.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu implements OnInit {
    model: MenuItem[] = [];

    constructor(private authService: AuthService, private permissionService: PermissionService) {}

    ngOnInit() {
        this.model = [
            {
                label: 'PRINCIPAL',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/dashboard'] },
                    { 
                        label: 'Minha Conta', 
                        icon: 'pi pi-fw pi-user', 
                        routerLink: ['/conta'],
                        visible: this.permissionService.canAccessConta()
                    }
                ]
            },
            {
                label: 'GESTÃO',
                items: [
                    { label: 'Receitas', icon: 'pi pi-fw pi-wallet', routerLink: ['/receitas'] },
                    { label: 'Despesas', icon: 'pi pi-fw pi-credit-card', routerLink: ['/despesas'] },
                    { label: 'Investimentos', icon: 'pi pi-fw pi-chart-line', routerLink: ['/investimentos'] }
                ]
            },
            {
                label: 'ANÁLISES',
                items: [
                    { label: 'Relatórios', icon: 'pi pi-fw pi-file', routerLink: ['/relatorios'] }
                ]
            },
            {
                label: 'SISTEMA',
                items: [
                    { 
                        label: 'Painel de Controle', 
                        icon: 'pi pi-fw pi-shield', 
                        routerLink: ['/admin'],
                        visible: this.authService.isAdmin()
                    },
                    { label: 'Configurações da Conta', icon: 'pi pi-fw pi-user-edit', routerLink: ['/config/conta'] },
                    { label: 'Notificações por E-mail', icon: 'pi pi-fw pi-envelope', routerLink: ['/config/notificacoes-email'] },
                    { label: 'Alertas de Cotação', icon: 'pi pi-fw pi-bell', routerLink: ['/config/alertas-cotacao'] },
                    { label: 'Segurança', icon: 'pi pi-fw pi-lock', routerLink: ['/config/seguranca'] },
                    { label: 'Histórico de Notificações', icon: 'pi pi-fw pi-history', routerLink: ['/config/historico-notificacoes'] }
                ]
            }
        ];
    }
}
