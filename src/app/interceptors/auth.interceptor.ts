import { HttpInterceptorFn } from '@angular/common/http';

function readToken(): string | null {
  try {
    const raw = localStorage.getItem('auth');
    if (!raw) return null;
    const obj = JSON.parse(raw);
    return obj?.token || obj?.accessToken || null;
  } catch {
    return null;
  }
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/api/v1/auth/login') || req.url.includes('/api/v1/auth/register')) {
    return next(req);
  }
  const token = readToken();
  if (!token) return next(req);
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
  return next(authReq);
};
