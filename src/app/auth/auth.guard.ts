import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuardTsGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const routerClient = inject(Router);

  const isAuth = authService.getIsAuth();
  if (!isAuth) {
    routerClient.navigate(['/login']);
  }
  return true;
};
