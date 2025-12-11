import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-status.component.html',
  styleUrls: ['./auth-status.component.css'],
})
export class AuthStatusComponent {
  constructor(private auth: AuthService) {}
  get loggedIn(): boolean {
    return this.auth.isLoggedIn();
  }
  get username(): string | null {
    return this.auth.getUsername();
  }
}
