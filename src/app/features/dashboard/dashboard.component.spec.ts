import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { ReceitaService } from '../../services/receita.service';
import { DespesaService } from '../../services/despesa.service';
import { CarteiraService } from '../../services/carteira.service';
import { SummaryService } from '../../services/summary.service';
import { AuthService } from '../../services/auth.service';
import { AiAssistantService } from '../../services/ai-assistant.service';
import { ThemeService } from '../../services/theme.service';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let receitaServiceSpy: jasmine.SpyObj<ReceitaService>;
  let despesaServiceSpy: jasmine.SpyObj<DespesaService>;
  let summaryServiceSpy: jasmine.SpyObj<SummaryService>;
  let carteiraServiceSpy: jasmine.SpyObj<CarteiraService>;

  beforeEach(async () => {
    receitaServiceSpy = jasmine.createSpyObj('ReceitaService', ['list']);
    despesaServiceSpy = jasmine.createSpyObj('DespesaService', ['list']);
    summaryServiceSpy = jasmine.createSpyObj('SummaryService', ['getResumo', 'getCarteira', 'getRelatorioMensal']);
    carteiraServiceSpy = jasmine.createSpyObj('CarteiraService', ['list']);
    const authSpy = jasmine.createSpyObj('AuthService', ['logout']);
    const aiSpy = jasmine.createSpyObj('AiAssistantService', ['ask']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, CommonModule, ChartModule, ReactiveFormsModule, FormsModule],
      providers: [
        { provide: ReceitaService, useValue: receitaServiceSpy },
        { provide: DespesaService, useValue: despesaServiceSpy },
        { provide: SummaryService, useValue: summaryServiceSpy },
        { provide: CarteiraService, useValue: carteiraServiceSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: AiAssistantService, useValue: aiSpy },
        { provide: Router, useValue: routerSpy },
        FormBuilder
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate KPIs correctly based on current month transactions', fakeAsync(() => {
    // Setup Dates
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentMonthStr = String(currentMonth).padStart(2, '0');
    
    const mockReceitas = [
      { id: 1, descricao: 'R1', valor: 1000, data: `${currentYear}-${currentMonthStr}-05`, categoria: 'A' },
      { id: 2, descricao: 'R2', valor: 200, data: `${currentYear}-${currentMonthStr}-10`, categoria: 'B' },
      { id: 3, descricao: 'Old R', valor: 5000, data: `${currentYear-1}-01-01`, categoria: 'C' } // Should be ignored
    ];

    const mockDespesas = [
      { id: 1, descricao: 'D1', valor: 500, data: `${currentYear}-${currentMonthStr}-02`, categoria: 'X' },
      { id: 2, descricao: 'Old D', valor: 100, data: `${currentYear-1}-01-01`, categoria: 'Y' } // Should be ignored
    ];

    receitaServiceSpy.list.and.returnValue(of(mockReceitas as any));
    despesaServiceSpy.list.and.returnValue(of(mockDespesas as any));
    
    // Mock other required calls
    summaryServiceSpy.getCarteira.and.returnValue(of({ saldoAtual: 0 } as any));
    summaryServiceSpy.getRelatorioMensal.and.returnValue(of({ totalReceitas: 0, totalDespesas: 0, saldo: 0 } as any));
    carteiraServiceSpy.list.and.returnValue(of([]));

    // Trigger Load
    component.ngOnInit();
    tick();

    // Verify
    // Receitas: 1000 + 200 = 1200
    // Despesas: 500
    // Saldo: 1200 - 500 = 700
    
    expect(component.kpis.receitas.value).toBe(1200);
    expect(component.kpis.despesas.value).toBe(500);
    expect(component.kpis.saldo.value).toBe(700);
  }));

  it('should clamp saldo to 0 if despesas > receitas', fakeAsync(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');

    const mockReceitas = [
      { id: 1, valor: 100, data: `${currentYear}-${currentMonth}-01`, categoria: 'A' }
    ];
    const mockDespesas = [
      { id: 1, valor: 200, data: `${currentYear}-${currentMonth}-01`, categoria: 'B' }
    ];

    receitaServiceSpy.list.and.returnValue(of(mockReceitas as any));
    despesaServiceSpy.list.and.returnValue(of(mockDespesas as any));
    
    summaryServiceSpy.getCarteira.and.returnValue(of({ saldoAtual: 0 } as any));
    summaryServiceSpy.getRelatorioMensal.and.returnValue(of({ totalReceitas: 0, totalDespesas: 0, saldo: 0 } as any));
    carteiraServiceSpy.list.and.returnValue(of([]));

    component.ngOnInit();
    tick();

    expect(component.kpis.receitas.value).toBe(100);
    expect(component.kpis.despesas.value).toBe(200);
    expect(component.kpis.saldo.value).toBe(0); // Should be 0, not -100
  }));

  it('should handle "100k revenue bug" correctly by summing properly', fakeAsync(() => {
    // User reported 100k revenue appearing as 9.6k expense or weirdness.
    // Ensure large numbers work.
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');

    const mockReceitas = [
      { id: 1, valor: 100000, data: `${currentYear}-${currentMonth}-01`, categoria: 'A' },
      { id: 2, valor: 500, data: `${currentYear}-${currentMonth}-02`, categoria: 'B' }
    ];
    const mockDespesas = [
      { id: 1, valor: 9600, data: `${currentYear}-${currentMonth}-03`, categoria: 'C' }
    ];

    receitaServiceSpy.list.and.returnValue(of(mockReceitas as any));
    despesaServiceSpy.list.and.returnValue(of(mockDespesas as any));
    
    summaryServiceSpy.getCarteira.and.returnValue(of({ saldoAtual: 0 } as any));
    summaryServiceSpy.getRelatorioMensal.and.returnValue(of({ totalReceitas: 0, totalDespesas: 0, saldo: 0 } as any));
    carteiraServiceSpy.list.and.returnValue(of([]));

    component.ngOnInit();
    tick();

    expect(component.kpis.receitas.value).toBe(100500);
    expect(component.kpis.despesas.value).toBe(9600);
    expect(component.kpis.saldo.value).toBe(100500 - 9600); // 90900
  }));
});
