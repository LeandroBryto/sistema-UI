import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { PermissionService } from '../services/permission.service';
import { AuthService } from '../services/auth.service';

export const contaAccessGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const permissionService = inject(PermissionService);
  const authService = inject(AuthService);

  if (permissionService.canAccessConta()) {
    return true;
  }

  // Optional: Redirect or show unauthorized
  // For now, redirect to dashboard
  return router.createUrlTree(['/dashboard']);
};
