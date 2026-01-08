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
        const isPremium = this.authService.getPlano() === 'PREMIUM';

        this.model = [
            {
                label: 'PRINCIPAL',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/dashboard'], visible: isPremium },
                    { 
                        label: 'Sistema de Estudos', 
                        icon: 'pi pi-fw pi-book', 
                        visible: !isPremium,
                        items: [
                            { label: 'Dashboard', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/estudos'] },
                            { label: 'Matérias', icon: 'pi pi-fw pi-list', routerLink: ['/estudos/materias'] },
                            { label: 'Modo Foco', icon: 'pi pi-fw pi-clock', routerLink: ['/estudos/modo-foco'] },
                            { label: 'Flashcards', icon: 'pi pi-fw pi-bookmark', routerLink: ['/estudos/flashcards'] },
                            { label: 'Agenda', icon: 'pi pi-fw pi-calendar', routerLink: ['/estudos/agenda'] },
                            { label: 'Perfil', icon: 'pi pi-fw pi-user', routerLink: ['/estudos/perfil'] },
                            { label: 'Cronograma', icon: 'pi pi-fw pi-calendar-plus', routerLink: ['/estudos/cronograma'] }
                        ]
                    },
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
                    { label: 'Receitas', icon: 'pi pi-fw pi-wallet', routerLink: ['/receitas'], visible: isPremium },
                    { label: 'Despesas', icon: 'pi pi-fw pi-credit-card', routerLink: ['/despesas'], visible: isPremium },
                    { label: 'Investimentos', icon: 'pi pi-fw pi-chart-line', routerLink: ['/investimentos'], visible: isPremium }
                ],
                visible: isPremium
            },
            {
                label: 'ANÁLISES',
                items: [
                    { label: 'Relatórios', icon: 'pi pi-fw pi-file', routerLink: ['/relatorios'], visible: isPremium }
                ],
                visible: isPremium
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
                    { label: 'Alertas Financeiros', icon: 'pi pi-fw pi-bell', routerLink: ['/config/alertas-financeiros'], visible: isPremium },
                    { label: 'Alertas de Cotação', icon: 'pi pi-fw pi-bell', routerLink: ['/config/alertas-cotacao'], visible: isPremium },
                    { label: 'Segurança', icon: 'pi pi-fw pi-lock', routerLink: ['/config/seguranca'] },
                    { label: 'Histórico de Notificações', icon: 'pi pi-fw pi-history', routerLink: ['/config/historico-notificacoes'] }
                ]
            }
        ];
    }
}
