import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GoalService } from '../../services/goal.service';
import { CotacaoDolarDTO } from '../../models/goal.models';

@Component({
  selector: 'app-cotacao-alerts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './cotacao-alerts.component.html',
  styleUrls: ['./settings.common.css'],
})
export class CotacaoAlertsComponent implements OnInit {
  form = this.fb.nonNullable.group({
    enabled: [false],
    percentual: [5, [Validators.min(1), Validators.max(100)]],
    horario: ['08:00'],
  });
  saving = false;
  saved = false;
  cotacao: CotacaoDolarDTO | null = null;
  constructor(private fb: FormBuilder, private goals: GoalService) {}

  ngOnInit(): void {
    this.goals.cotacaoDolar().subscribe((c) => (this.cotacao = c));
  }
  save(): void {
    this.saving = true;
    setTimeout(() => { this.saving = false; this.saved = true; }, 800);
  }
}
