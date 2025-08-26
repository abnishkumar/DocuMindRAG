import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Add token to request if it exists
  const authReq = token 
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError(error => {
      // Handle unauthorized error
      if (error.status === 401) {
        return authService.refreshToken().pipe(
          // Try request again with new token
          switchMap(newToken => {
            const newAuthReq = req.clone({ 
              setHeaders: { Authorization: `Bearer ${newToken.access_token}` }
            });
            return next(newAuthReq);
          }),
          // If refresh fails, logout
          catchError(() => {
            authService.logout();
            return throwError(() => error);
          })
        );
      }
      // Pass through other errors
      return throwError(() => error);
    })
  );
};