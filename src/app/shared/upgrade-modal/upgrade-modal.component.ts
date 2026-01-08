import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-upgrade-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  template: `
    <p-dialog 
      [(visible)]="visible" 
      [modal]="true" 
      [closable]="true" 
      [style]="{ width: '400px' }"
      header="Upgrade Necessário">
      <p>Para acessar o módulo financeiro, você precisa de um plano PREMIUM.</p>
      <p>Faça o upgrade agora para desbloquear todas as funcionalidades!</p>
      <ng-template pTemplate="footer">
        <p-button label="Cancelar" icon="pi pi-times" (click)="onCancel()" class="p-button-text"></p-button>
        <p-button label="Fazer Upgrade" icon="pi pi-star" (click)="onUpgrade()" class="p-button-primary"></p-button>
      </ng-template>
    </p-dialog>
  `,
  styles: ``
})
export class UpgradeModalComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() upgrade = new EventEmitter<void>();

  onCancel() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onUpgrade() {
    this.upgrade.emit();
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
