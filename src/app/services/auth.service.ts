import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../enviroment/enviroment';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'client';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private platformId = inject(PLATFORM_ID);
  
  // Reactive state
  currentUser = signal<User | null>(null);
  token = signal<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.loadToken();
  }

  private loadToken() {
    if (isPlatformBrowser(this.platformId)) {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      if (savedToken && savedUser) {
        this.token.set(savedToken);
        this.currentUser.set(JSON.parse(savedUser));
      }
    }
  }

  login(credentials: { username: string, password: string }) {
    return this.http.post<{ token: string, user: User }>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
        }
        this.token.set(res.token);
        this.currentUser.set(res.user);
      })
    );
  }

  register(credentials: { username: string, password: string }) {
    return this.http.post(`${this.apiUrl}/register`, credentials);
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.token();
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }
}
