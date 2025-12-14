import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './account-settings.component.html',
  styleUrls: ['./settings.common.css'],
})
export class AccountSettingsComponent {}

