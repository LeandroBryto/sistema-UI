import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EnvService {
  apiBase(): string {
    return environment.apiBaseAuth || 'http://localhost:8084';
  }
  apiAuthBase(): string {
    return environment.apiBaseAuth;
  }
  isProd(): boolean {
    return !!environment.production;
  }
  ambiente(): string {
    return environment.ambiente;
  }
}

