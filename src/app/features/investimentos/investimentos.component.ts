import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TaxasService, TaxasDTO } from '../../services/taxas.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-investimentos',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, CardModule],
  templateUrl: './investimentos.component.html',
  styleUrls: ['./investimentos.component.css']
})
export class InvestimentosComponent implements OnInit {
  taxas: TaxasDTO | null = null;
  taxasLoading = false;
  
  dicas = [
    { title: 'Reserva de Emergência', content: 'Mantenha pelo menos 6 meses do seu custo de vida em liquidez diária (CDB ou Tesouro Selic).' },
    { title: 'Diversificação', content: 'Não coloque todos os ovos na mesma cesta. Misture Renda Fixa e Renda Variável conforme seu perfil.' },
    { title: 'Juros Compostos', content: 'O tempo é seu melhor amigo. Comece a investir cedo, mesmo que com pouco.' }
  ];

  constructor(private taxasService: TaxasService) {}

  ngOnInit(): void {
    this.loadTaxas();
  }

  loadTaxas(): void {
    this.taxasLoading = true;
    this.taxasService.getTaxas().subscribe((t: TaxasDTO) => {
      this.taxas = t;
      this.taxasLoading = false;
    });
  }
}
