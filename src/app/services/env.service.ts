import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EnvService {
  apiBase(): string {
    return environment.apiBase || 'http://localhost:8080';
  }
  apiAuthBase(): string {
    return environment.apiBaseAuth || 'http://localhost:8084';
  }
  apiEstudosBase(): string {
    return environment.apiEstudosBase || 'http://localhost:8083';
  }
}

