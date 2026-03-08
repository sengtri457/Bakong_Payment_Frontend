import { Component, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  template: `
    <header class="topbar">
      <div class="search-bar">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" placeholder="Search products, orders, customers..." />
      </div>
      
      <div class="actions">
        <button class="icon-btn" aria-label="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1.2rem; height:1.2rem;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        </button>
        <button class="icon-btn" aria-label="Settings">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1.2rem; height:1.2rem;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        </button>
        <div class="user-profile">
          <div class="avatar">{{ (user()?.username?.charAt(0) || 'L').toUpperCase() }}</div>
          <div class="user-info">
            <span class="name">{{ user()?.username || 'Guest' }}</span>
            <span class="role">{{ user()?.role || 'Retailer' }}</span>
          </div>
        </div>
        <button class="icon-btn logout-btn" aria-label="Logout" (click)="logout()" title="Logout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1.1rem; height:1.1rem;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1-2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        </button>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      background: #ffffff;
      border-bottom: 1px solid #f1f3f9;
      flex-shrink: 0;
      z-index: 50;
    }
    .search-bar {
      display: flex;
      align-items: center;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 0.5rem 1rem;
      width: 440px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .search-bar:focus-within {
      background: #fff;
      border-color: var(--luxe-primary);
      box-shadow: 0 4px 12px rgba(255, 51, 102, 0.08);
      width: 480px;
    }
    .search-icon {
      width: 16px;
      height: 16px;
      color: #94a3b8;
      margin-right: 0.75rem;
    }
    .search-bar input {
      background: none;
      border: none;
      color: var(--luxe-text);
      font-size: 0.9rem;
      font-weight: 500;
      width: 100%;
      outline: none;
    }
    .search-bar input::placeholder {
      color: #94a3b8;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .icon-btn {
      background: #ffffff;
      border: 1px solid #eef0f7;
      color: #64748b;
      cursor: pointer;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .icon-btn:hover {
      background: #f8fafc;
      color: var(--luxe-text);
      border-color: #cbd5e1;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding-left: 1rem;
      border-left: 1px solid #f1f3f9;
    }
    .avatar {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: var(--luxe-text);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1rem;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .user-info {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }
    .name {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--luxe-text);
    }
    .role {
      font-size: 0.7rem;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .logout-btn { 
      background: #fef2f2; 
      color: #dc2626; 
      border-color: #fee2e2;
    }
    .logout-btn:hover { 
      background: #dc2626; 
      color: white; 
      border-color: #dc2626;
    }
  `]
})
export class TopbarComponent {
  authService = inject(AuthService);
  user = this.authService.currentUser;

  logout() {
    this.authService.logout();
  }
}
