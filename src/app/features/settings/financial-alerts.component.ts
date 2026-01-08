import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { MessageModule } from 'primeng/message';
import { GoalService } from '../../services/goal.service';
import { CotacaoDolarDTO } from '../../models/goal.models';

interface AlertaConfig {
  tipo: string;
  enabled: boolean;
  valor?: number;
  frequencia?: string;
}

@Component({
  selector: 'app-financial-alerts',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CardModule,
    ButtonModule,
    InputSwitchModule,
    InputNumberModule,
    InputTextModule,
    DropdownModule,
    MessageModule
  ],
  templateUrl: './financial-alerts.component.html',
  styleUrls: ['./financial-alerts.component.css'],
})
export class FinancialAlertsComponent implements OnInit {
  cotacao: CotacaoDolarDTO | null = null;

  alertasForm = this.fb.nonNullable.group({
    cotacao: this.fb.group({
      enabled: [false],
      percentual: [5, [Validators.min(1), Validators.max(100)]],
      horario: ['08:00']
    }),
    metas: this.fb.group({
      enabled: [false],
      tipo: ['atingida']
    }),
    orcamento: this.fb.group({
      enabled: [false],
      percentual: [80, [Validators.min(1), Validators.max(100)]]
    }),
    pagamentos: this.fb.group({
      enabled: [false],
      diasAntes: [3, [Validators.min(1), Validators.max(30)]]
    })
  });

  saving = false;
  saved = false;

  tiposMeta = [
    { label: 'Quando atingir a meta', value: 'atingida' },
    { label: 'Quando estiver próximo (80%)', value: 'proximo' }
  ];

  constructor(private fb: FormBuilder, private goals: GoalService) {}

  ngOnInit(): void {
    this.goals.cotacaoDolar().subscribe((c) => (this.cotacao = c));
  }

  get cotacaoForm(): any {
    return this.alertasForm.get('cotacao');
  }

  get metasForm(): any {
    return this.alertasForm.get('metas');
  }

  get orcamentoForm(): any {
    return this.alertasForm.get('orcamento');
  }

  get pagamentosForm(): any {
    return this.alertasForm.get('pagamentos');
  }

  save(): void {
    this.saving = true;
    setTimeout(() => {
      this.saving = false;
      this.saved = true;
      setTimeout(() => this.saved = false, 3000);
    }, 800);
  }
}