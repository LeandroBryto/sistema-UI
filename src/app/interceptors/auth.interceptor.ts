import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (
    req.url.includes('/api/v1/auth/login') ||
    req.url.includes('/api/v1/auth/register') ||
    req.url.includes('/api/v1/auth/esqueci-senha') ||
    req.url.includes('/api/v1/auth/redefinir-senha') ||
    req.url.includes('/api/v1/auth/refresh')
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
  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401 && !isRefreshing && !req.url.includes('/api/v1/estudo/finalizar')) {
        isRefreshing = true;
        const refreshToken = authService.getRefreshToken();
        if (refreshToken) {
          return authService.refreshToken().pipe(
            switchMap(() => {
              isRefreshing = false;
              const newToken = authService.getAccessToken();
              const newAuthReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`,
                },
              });
              return next(newAuthReq);
            }),
            catchError(() => {
              isRefreshing = false;
              // Temporariamente desabilitar logout
              console.error('Refresh token failed, but not logging out');
              return throwError(() => error);
            })
          );
        } else {
          isRefreshing = false;
          // Temporariamente desabilitar logout
          console.error('No refresh token, but not logging out');
          return throwError(() => error);
        }
      } else if (error.status === 401 && req.url.includes('/api/v1/estudo/finalizar')) {
        // Para finalizar estudo, não fazer logout, apenas retornar erro
        return throwError(() => error);
      }
      return throwError(() => error);
    })
  );
};
