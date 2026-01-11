import { Component, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { AppMenu } from './app.menu';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [AppMenu],
    template: ` <div class="layout-sidebar">
        <app-menu (upgradeRequested)="onUpgradeRequested()"></app-menu>
    </div>`
})
export class AppSidebar {
    @ViewChild(AppMenu) appMenu!: AppMenu;

    @Output() upgradeRequested = new EventEmitter<void>();

    constructor(public el: ElementRef) {}

    onUpgradeRequested() {
        this.upgradeRequested.emit();
    }
}
