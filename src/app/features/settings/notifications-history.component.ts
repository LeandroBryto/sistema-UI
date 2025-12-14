import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Row { tipo: string; dataHora: string; status: string; }

@Component({
  selector: 'app-notifications-history',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './notifications-history.component.html',
  styleUrls: ['./settings.common.css'],
})
export class NotificationsHistoryComponent {
  rows: Row[] = [
    { tipo: 'E-mail Cotação', dataHora: '13/12/2025 08:00', status: 'ENTREGUE' },
    { tipo: 'Alerta Variação', dataHora: '12/12/2025 08:00', status: 'IGNORADO' },
  ];
  filtro = { inicio: '', fim: '' };
}
