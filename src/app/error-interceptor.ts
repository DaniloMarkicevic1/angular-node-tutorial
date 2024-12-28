import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ErrorComponent } from './error/error.component';
export function errorInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) {
  const dialogService = inject(MatDialog);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('🚀 ~ file: error-interceptor.ts:17 ~ error:', error);
      //   console.log('error:', error);
      let errorMessage = 'An unknown error occured!';

      if (error.error.message) {
        errorMessage = error.error.message;
      }
      dialogService.open(ErrorComponent, {
        data: { message: errorMessage },
        direction: 'ltr',
      });
      //   alert(error.message);
      return throwError(() => error);
    })
  );
}
