import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export function authInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) {
  // Inject the current `AuthService` and use it to get an authentication token:
  const authToken = inject(AuthService).getToken();
  // Clone the request to add the authentication header.
  const newReq = req.clone({
    headers: req.headers.set('Authorization', 'Bearer ' + authToken),
  });
  return next(newReq);
}
