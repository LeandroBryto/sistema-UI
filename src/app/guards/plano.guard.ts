import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UpgradeService } from '../services/upgrade.service';

export const planoGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const upgradeService = inject(UpgradeService);
  const plano = auth.getPlano();

  if (plano === 'PREMIUM') {
    return true;
  }

  // Mostrar modal de upgrade
  upgradeService.showUpgradeModal();
  return false;
};