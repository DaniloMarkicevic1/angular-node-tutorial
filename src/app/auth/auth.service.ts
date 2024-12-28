import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthData } from './auth-data.model';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment.development';

const BACKEND_URL = environment.apiUrl + 'user/';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token = signal<string | undefined>(undefined);
  private tokenTimer = signal<NodeJS.Timeout | undefined>(undefined);
  private authStatusListener = new Subject<boolean>();
  private userId = signal<string>('');
  private isAuthenticated = signal(false);

  private httpClient = inject(HttpClient);
  private routerClient = inject(Router);

  getToken() {
    return this.token();
  }
  getIsAuth() {
    return this.isAuthenticated();
  }
  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getUserId() {
    return this.userId();
  }

  createUser(email: string, password: string) {
    const authData: AuthData = { email, password };

    return this.httpClient.post(BACKEND_URL + 'signup', authData).subscribe({
      next: (response: any) => {
        this.routerClient.navigate(['/']);
        console.log('🚀 ~ file: auth.service.ts:19 ~ response:', response);
      },
      error: (err) => {
        this.authStatusListener.next(false);
        console.log(err);
      },
    });
  }

  login(email: string, password: string) {
    const authData: AuthData = { email, password };

    this.httpClient
      .post<{ token: string; expiresIn: number; userId: string }>(
        BACKEND_URL + 'login',
        authData
      )
      .subscribe({
        next: (response) => {
          this.token.set(response.token);

          if (response.token) {
            const expiresInDuration = response.expiresIn;
            this.setAuthTimer(expiresInDuration);
            this.isAuthenticated.set(true);
            this.authStatusListener.next(true);
            this.userId.set(response.userId);
            const now = new Date();
            const expirationDate = new Date(
              now.getTime() + expiresInDuration * 1000
            );

            this.saveAuthData(response.token, expirationDate, response.userId);
            this.routerClient.navigate(['/']);
          }
        },
        error: (err) => {
          this.authStatusListener.next(false);
          console.log(err);
        },
      });
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer.set(
      setTimeout(() => {
        this.logout();
      }, duration * 1000)
    );
  }

  autoAuthUser() {
    const authInfo = this.getAuthData();

    if (!authInfo) return;

    const now = new Date();
    const expiresIn = authInfo?.date.getTime() - now.getTime();

    if (expiresIn > 0) {
      this.token.set(authInfo.token);
      this.userId.set(authInfo.userId);
      this.setAuthTimer(expiresIn / 1000);
      this.isAuthenticated.set(true);
      this.authStatusListener.next(true);
    }
  }

  private getAuthData() {
    const authData = localStorage.getItem('authData');

    if (!authData) return;

    const parsedData: { token: string; date: string; userId: string } =
      JSON.parse(authData);

    return {
      token: parsedData.token,
      date: new Date(parsedData.date),
      userId: parsedData.userId,
    };
  }

  logout() {
    this.clearAuthData();
    if (this.tokenTimer() !== undefined) {
      clearTimeout(this.tokenTimer());
    }
    this.token.set(undefined);
    this.userId.set('');
    this.isAuthenticated.set(false);
    this.authStatusListener.next(false);
    this.routerClient.navigate(['/']);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    const date = expirationDate.toString();
    const authData = JSON.stringify({ token, date, userId });
    localStorage.setItem('authData', authData);
  }

  private clearAuthData() {
    localStorage.removeItem('authData');
  }
}
