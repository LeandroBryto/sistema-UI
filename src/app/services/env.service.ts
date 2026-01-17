import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EnvService {
  apiBase(): string {
    return environment.apiBaseAuth || 'https://nexus-auth.fly.dev';
  }
  apiAuthBase(): string {
    return environment.apiBaseAuth || 'https://nexus-auth.fly.dev';
  }
  apiEstudosBase(): string {
    return environment.apiEstudosBase || 'http://localhost:8083';
  }
}

