import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (
    req.url.includes('/api/v1/auth/login') ||
    req.url.includes('/api/v1/auth/register') ||
    req.url.includes('/api/v1/auth/esqueci-senha') ||
    req.url.includes('/api/v1/auth/redefinir-senha')
  ) {
    return next(req);
  }
  const token = authService.getAccessToken();
  if (!token) return next(req);
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
  return next(authReq);
};
