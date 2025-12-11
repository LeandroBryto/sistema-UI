import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStatusComponent } from './shared/auth-status/auth-status.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AuthStatusComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'sistema-web';
  constructor(private auth: AuthService) {}
  loggedIn(): boolean {
    return this.auth.isLoggedIn();
  }
}
