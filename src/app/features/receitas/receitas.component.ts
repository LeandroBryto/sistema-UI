import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-receitas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './receitas.component.html',
  styleUrls: ['./receitas.component.css'],
})
export class ReceitasComponent {
  items: unknown[] = [];
}
