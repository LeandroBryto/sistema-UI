import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-settings-menu',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './settings-menu.component.html',
  styleUrls: ['./settings-menu.component.css'],
})
export class SettingsMenuComponent {
  open = false;
  toggle(): void { this.open = !this.open; }
}

