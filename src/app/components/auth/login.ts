import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <div class="login-header">
          <div class="brand-icon">✨</div>
          <h2>{{ isRegistering() ? 'Create an Account' : 'Welcome to Aura' }}</h2>
          <p>{{ isRegistering() ? 'Sign up to purchase premium clothing' : 'Sign in to access your account' }}</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="username">Username</label>
            <input 
              id="username" 
              type="text" 
              name="username" 
              class="form-control" 
              [(ngModel)]="username" 
              required
              placeholder="e.g., john_doe"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input 
              id="password" 
              type="password" 
              name="password" 
              class="form-control" 
              [(ngModel)]="password" 
              required
              placeholder="••••••••"
            />
          </div>

          <div *ngIf="error()" class="error-message">
            {{ error() }}
          </div>
          <div *ngIf="successMsg()" class="success-message">
            {{ successMsg() }}
          </div>

          <button type="submit" class="btn-primary login-btn" [disabled]="loading()">
            <span *ngIf="!loading()">{{ isRegistering() ? 'Register' : 'Sign In' }}</span>
            <span *ngIf="loading()">{{ isRegistering() ? 'Creating account...' : 'Authenticating...' }}</span>
          </button>
        </form>
        
        <div class="footer-note">
           <a (click)="toggleMode()" class="toggle-link">
             {{ isRegistering() ? 'Already have an account? Sign in' : "Don't have an account? Register" }}
           </a>
        </div>
        <div class="footer-note" *ngIf="!isRegistering()" style="margin-top: 1rem; opacity: 0.5;">
           (Default admin: admin / password123)
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--bg) 0%, #1e293b 100%);
    }

    .login-card {
      background: var(--surface);
      padding: 3rem;
      border-radius: 24px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
      border: 1px solid var(--border);
    }

    .login-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .brand-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    h2 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 0.5rem;
    }

    p {
      color: var(--muted);
      font-size: 0.95rem;
    }

    .login-form .form-group {
      margin-bottom: 1.5rem;
    }

    .login-form label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text);
    }

    .login-form .form-control {
      width: 100%;
      padding: 0.875rem 1rem;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      color: var(--text);
      font-size: 1rem;
      transition: all 0.2s ease;
    }

    .login-form .form-control:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(79, 142, 247, 0.2);
    }

    .error-message {
      background: rgba(239, 68, 68, 0.1);
      color: var(--red);
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
      text-align: center;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .login-btn {
      width: 100%;
      padding: 1rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 12px;
      margin-top: 1rem;
    }

    .footer-note {
      text-align: center;
      margin-top: 2rem;
      font-size: 0.85rem;
      color: var(--muted);
    }
    .success-message {
      background: rgba(34, 197, 94, 0.1);
      color: #22c55e;
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
      text-align: center;
      border: 1px solid rgba(34, 197, 94, 0.2);
    }
    .toggle-link {
      color: var(--accent);
      cursor: pointer;
      text-decoration: underline;
    }
    .toggle-link:hover {
      color: var(--text);
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  loading = signal(false);
  error = signal('');
  successMsg = signal('');
  isRegistering = signal(false);

  toggleMode() {
    this.isRegistering.update(v => !v);
    this.error.set('');
    this.successMsg.set('');
  }

  onSubmit() {
    if (!this.username || !this.password) {
      this.error.set('Please fill all fields');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.successMsg.set('');

    if (this.isRegistering()) {
      this.authService.register({ username: this.username, password: this.password }).subscribe({
        next: () => {
          this.loading.set(false);
          this.successMsg.set('Registration successful! Please sign in.');
          this.isRegistering.set(false);
          this.password = ''; // Clear password field for safety
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Registration failed. Username may exist.');
        }
      });
    } else {
      this.authService.login({ username: this.username, password: this.password }).subscribe({
        next: () => {
          this.loading.set(false);
          // Auto route depending on Role
          if (this.authService.isAdmin()) {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/store']);
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Invalid username or password');
        }
      });
    }
  }
}
