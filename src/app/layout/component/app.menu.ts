import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from '../../services/auth.service';
import { PermissionService } from '../../services/permission.service';
import { LayoutService } from '../service/layout.service';

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
export class AppMenu implements OnInit, OnDestroy {
    model: MenuItem[] = [];

    @Output() upgradeRequested = new EventEmitter<void>();

    constructor(private authService: AuthService, private permissionService: PermissionService, private layoutService: LayoutService) {}

    ngOnInit() {
        this.updateMenu();

        // Inscrever-se nas mudanças de contexto
        this.layoutService.contextChange$.subscribe((context) => {
            console.log('Menu Debug - Context change received:', context);
            this.updateMenu();
        });
    }

    ngOnDestroy() {
        // Cleanup se necessário
    }

    updateMenu() {
        const plano = this.authService.getPlano();
        const isPremium = plano === 'PREMIUM' || plano === 'premium';
        const isLoggedIn = this.authService.isLoggedIn();
        const context = this.layoutService.layoutState().context || 'financeiro';

        console.log('Menu Debug - updateMenu called:', { plano, isPremium, isLoggedIn, context, menuType: context === 'financeiro' ? 'FINANCEIRO' : 'ESTUDOS' });

        if (context === 'financeiro') {
            this.model = this.getFinanceiroMenu(isPremium, isLoggedIn);
        } else {
            this.model = this.getEstudosMenu(isPremium, isLoggedIn);
        }
    }

    private getFinanceiroMenu(isPremium: boolean, isLoggedIn: boolean): MenuItem[] {
        return [
            {
                label: 'PRINCIPAL',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/dashboard'], visible: isPremium },
                    { label: 'Home', icon: 'pi pi-fw pi-home', routerLink: ['/home'], visible: !isPremium },
                ]
            },
            {
                label: 'FINANCEIRO',
                items: [
                    { label: 'Receitas', icon: 'pi pi-fw pi-plus-circle', routerLink: ['/receitas'], visible: isPremium },
                    { label: 'Despesas', icon: 'pi pi-fw pi-minus-circle', routerLink: ['/despesas'], visible: isPremium },
                    { label: 'Relatórios', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/relatorios'], visible: isPremium },
                    { label: 'Investimentos', icon: 'pi pi-fw pi-chart-line', routerLink: ['/investimentos'], visible: isPremium },
                    { label: 'Metas', icon: 'pi pi-fw pi-target', routerLink: ['/metas'], visible: isPremium },
                ]
            },
            {
                label: 'CONTA',
                items: [
                    { label: 'Minha Conta', icon: 'pi pi-fw pi-user', routerLink: ['/conta'] },
                ]
            },
            {
                label: 'ADMIN',
                items: [
                    { label: 'Administração', icon: 'pi pi-fw pi-cog', routerLink: ['/admin'], visible: this.authService.isAdmin() },
                ]
            },
            {
                label: 'CONFIGURAÇÕES',
                items: [
                    { label: 'Conta', icon: 'pi pi-fw pi-user', routerLink: ['/config/conta'] },
                    { label: 'Notificações por Email', icon: 'pi pi-fw pi-envelope', routerLink: ['/config/notificacoes-email'] },
                    { label: 'Alertas de Cotações', icon: 'pi pi-fw pi-bell', routerLink: ['/config/alertas-cotacao'], visible: isPremium },
                    { label: 'Alertas Financeiros', icon: 'pi pi-fw pi-bell', routerLink: ['/config/alertas-financeiros'], visible: isPremium },
                    { label: 'Segurança', icon: 'pi pi-fw pi-shield', routerLink: ['/config/seguranca'] },
                    { label: 'Histórico de Notificações', icon: 'pi pi-fw pi-history', routerLink: ['/config/historico-notificacoes'] },
                ]
            }
        ];
    }

    private getEstudosMenu(isPremium: boolean, isLoggedIn: boolean): MenuItem[] {
        const menu: MenuItem[] = [
            {
                label: 'ESTUDOS',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/estudos'] },
                    { label: 'Matérias', icon: 'pi pi-fw pi-list', routerLink: ['/estudos/materias'] },
                    { label: 'Modo Foco', icon: 'pi pi-fw pi-clock', routerLink: ['/estudos/modo-foco'] },
                    { label: 'Flashcards', icon: 'pi pi-fw pi-bookmark', routerLink: ['/estudos/flashcards'] },
                    { label: 'Agenda', icon: 'pi pi-fw pi-calendar', routerLink: ['/estudos/agenda'] },
                    { label: 'Tarefas', icon: 'pi pi-fw pi-list-check', routerLink: ['/estudos/tarefas'] },
                    { label: 'Perfil', icon: 'pi pi-fw pi-user', routerLink: ['/estudos/perfil'] },
                    { label: 'Cronograma', icon: 'pi pi-fw pi-calendar-plus', routerLink: ['/estudos/cronograma'] }
                ]
            }
        ];

        // Adicionar seção de upgrade se não for premium
        if (!isPremium) {
            menu.push({
                label: 'UPGRADE',
                items: [
                    {
                        label: 'Virar Premium',
                        icon: 'pi pi-fw pi-star',
                        command: () => this.showUpgradeModal()
                    }
                ]
            });
        }

        return menu;
    }

    private showUpgradeModal() {
        this.upgradeRequested.emit();
    }
}
