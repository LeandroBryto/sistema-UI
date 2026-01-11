import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-pix-payment-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, InputTextModule, MessageModule],
  template: `
    <p-dialog
      [(visible)]="visible"
      [modal]="true"
      [closable]="true"
      [style]="{ width: '500px' }"
      header="Pague com PIX para liberar seu acesso Premium">
      <div class="p-fluid">
        <div class="p-field" *ngIf="qrCodeBase64">
          <label>QR Code:</label>
          <div class="text-center">
            <img [src]="'data:image/png;base64,' + qrCodeBase64" alt="QR Code PIX" class="qr-code" />
          </div>
        </div>

        <div class="p-field" *ngIf="pixCode">
          <label for="pixCode">Código PIX (Copia e Cola):</label>
          <div class="p-inputgroup">
            <input
              id="pixCode"
              type="text"
              pInputText
              [value]="pixCode"
              readonly
              class="pix-code-input" />
            <p-button
              icon="pi pi-copy"
              (click)="copyPixCode()"
              pTooltip="Copiar código"
              tooltipPosition="top"></p-button>
          </div>
        </div>

        <div class="p-field">
          <p-message
            severity="info"
            text="Abra seu app do banco e pague via PIX. Após o pagamento, seu acesso será liberado automaticamente em alguns segundos."></p-message>
        </div>

        <div class="p-field text-center" *ngIf="!loading">
          <p-button
            label="Já paguei"
            icon="pi pi-check"
            (click)="onPaymentConfirmed()"
            class="p-button-success"></p-button>
        </div>
      </div>

      <ng-template pTemplate="footer" *ngIf="loading">
        <p-button label="Gerando PIX..." icon="pi pi-spin pi-spinner" disabled></p-button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .qr-code {
      max-width: 200px;
      max-height: 200px;
      margin: 0 auto;
      display: block;
    }
    .pix-code-input {
      font-family: monospace;
      font-size: 12px;
    }
    .text-center {
      text-align: center;
    }
  `]
})
export class PixPaymentModalComponent {
  @Input() visible = false;
  @Input() loading = false;
  @Input() pixCode = '';
  @Input() qrCodeBase64 = '';

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() paymentConfirmed = new EventEmitter<void>();

  copyPixCode() {
    if (this.pixCode) {
      navigator.clipboard.writeText(this.pixCode).then(() => {
        // Poderia mostrar um toast de sucesso aqui
        console.log('Código PIX copiado!');
      });
    }
  }

  onPaymentConfirmed() {
    this.paymentConfirmed.emit();
    this.visible = false;
    this.visibleChange.emit(false);
  }
}