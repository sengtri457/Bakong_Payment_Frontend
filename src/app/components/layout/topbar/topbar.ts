import { Component, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  template: `
    <header class="topbar">
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input type="text" placeholder="Search products, orders, customers..." />
      </div>
      
      <div class="actions">
        <button class="icon-btn" aria-label="Notifications">
          <span class="icon">🔔</span>
        </button>
        <button class="icon-btn" aria-label="Settings">
          <span class="icon">⚙️</span>
        </button>
        <div class="user-profile">
          <div class="avatar">A</div>
          <div class="user-info">
            <span class="name">{{ user()?.username || 'Guest' }}</span>
            <span class="role">{{ user()?.role || 'User' }}</span>
          </div>
        </div>
        <button class="icon-btn logout-btn" aria-label="Logout" (click)="logout()" title="Logout">
          <span class="icon">🚪</span>
        </button>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      background: var(--surface, #1a1d27);
      border-bottom: 1px solid var(--border, #2e3349);
      flex-shrink: 0;
    }
    .search-bar {
      display: flex;
      align-items: center;
      background: var(--surface2, #23273a);
      border-radius: 8px;
      padding: 0.5rem 1rem;
      width: 350px;
      border: 1px solid transparent;
      transition: border-color 0.2s;
    }
    .search-bar:focus-within {
      border-color: var(--accent, #4f8ef7);
    }
    .search-icon {
      font-size: 1rem;
      opacity: 0.5;
      margin-right: 0.75rem;
    }
    .search-bar input {
      background: none;
      border: none;
      color: var(--text, #e4e8f5);
      font-size: 0.9rem;
      width: 100%;
      outline: none;
    }
    .search-bar input::placeholder {
      color: var(--muted, #8892b0);
    }
    .actions {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .icon-btn {
      background: none;
      border: none;
      color: var(--muted, #8892b0);
      cursor: pointer;
      font-size: 1.25rem;
      transition: color 0.2s;
    }
    .icon-btn:hover {
      color: var(--text, #e4e8f5);
    }
    .logout-btn:hover {
      color: var(--red);
    }
    .user-profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding-left: 1rem;
      border-left: 1px solid var(--border, #2e3349);
    }
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent, #4f8ef7), var(--accent2, #7c5cfc));
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1rem;
      text-transform: uppercase;
    }
    .user-info {
      display: flex;
      flex-direction: column;
    }
    .name {
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: capitalize;
    }
    .role {
      font-size: 0.7rem;
      color: var(--muted, #8892b0);
      text-transform: capitalize;
    }
  `]
})
export class Topbar {
  authService = inject(AuthService);
  user = this.authService.currentUser;

  logout() {
    this.authService.logout();
  }
}
