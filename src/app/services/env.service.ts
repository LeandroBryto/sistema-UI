import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EnvService {
  apiBase(): string {
    return environment.apiBase;
  }
  apiAuthBase(): string {
    return environment.apiBaseAuth || environment.apiBase;
  }
  isProd(): boolean {
    return !!environment.production;
  }
  ambiente(): string {
    return environment.ambiente;
  }
}

