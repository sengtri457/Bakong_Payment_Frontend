import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar" [class.collapsed]="ui.isSidebarCollapsed()">
      <div class="logo-area">
        <div class="logo-content" *ngIf="!ui.isSidebarCollapsed()">
          <div class="logo-icon">✨</div>
          <div class="brand">2R3NY<span>Cosmetic</span></div>
        </div>
        <div class="logo-icon mini" *ngIf="ui.isSidebarCollapsed()">✨</div>
        <button class="collapse-toggle" (click)="ui.toggleSidebar()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
      </div>
      
      <nav class="nav-menu">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item" title="Dashboard">
          <svg class="ni-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          <span class="label" *ngIf="!ui.isSidebarCollapsed()">Dashboard</span>
        </a>
        
        <a routerLink="/pos" routerLinkActive="active" class="nav-item pos-btn" title="Point of Sale">
          <svg class="ni-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          <span class="label" *ngIf="!ui.isSidebarCollapsed()">Point of Sale</span>
        </a>

        <div class="nav-section" *ngIf="!ui.isSidebarCollapsed()">Management</div>
        <div class="nav-section-mini" *ngIf="ui.isSidebarCollapsed()">•</div>

        <a routerLink="/products" routerLinkActive="active" class="nav-item" title="Products">
          <svg class="ni-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
          <span class="label" *ngIf="!ui.isSidebarCollapsed()">Products</span>
        </a>
        <a routerLink="/categories" routerLinkActive="active" class="nav-item" title="Categories">
          <svg class="ni-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
          <span class="label" *ngIf="!ui.isSidebarCollapsed()">Categories</span>
        </a>
        <a routerLink="/purchases" routerLinkActive="active" class="nav-item" title="Purchases">
          <svg class="ni-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          <span class="label" *ngIf="!ui.isSidebarCollapsed()">Purchase Orders</span>
        </a>
        
        <ng-container *ngIf="isAdmin()">
          <div class="nav-section" *ngIf="!ui.isSidebarCollapsed()">Administration</div>
          <div class="nav-section-mini" *ngIf="ui.isSidebarCollapsed()">•</div>
          
          <a routerLink="/suppliers" routerLinkActive="active" class="nav-item" title="Suppliers">
            <svg class="ni-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
            <span class="label" *ngIf="!ui.isSidebarCollapsed()">Suppliers</span>
          </a>
          <a routerLink="/customers" routerLinkActive="active" class="nav-item" title="Customers">
            <svg class="ni-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span class="label" *ngIf="!ui.isSidebarCollapsed()">Customers</span>
          </a>
          
          <div class="nav-section" *ngIf="!ui.isSidebarCollapsed()">Reports</div>
          <div class="nav-section-mini" *ngIf="ui.isSidebarCollapsed()">•</div>

          <a routerLink="/sales" routerLinkActive="active" class="nav-item" title="Sales History">
            <svg class="ni-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            <span class="label" *ngIf="!ui.isSidebarCollapsed()">Sales History</span>
          </a>
        </ng-container>
      </nav>

      <div class="sidebar-footer">
        <a routerLink="/store" class="nav-item store-link" target="_blank" title="Client View">
          <svg class="ni-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
          <span class="label" *ngIf="!ui.isSidebarCollapsed()">Client Store</span>
        </a>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar { 
      width: 260px; 
      min-height: 100vh; 
      background: #ffffff; 
      border-right: 1px solid #f1f3f9; 
      display: flex; 
      flex-direction: column; 
      padding: 1.5rem 1rem; 
      flex-shrink: 0; 
      position: sticky;
      top: 0;
      z-index: 1000;
      transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;
    }

    .sidebar.collapsed { width: 84px; padding: 1.5rem 0.5rem; }

    .logo-area { 
      display: flex; 
      align-items: center; 
      justify-content: space-between;
      gap: 0.85rem; 
      padding: 0 0.5rem 3rem; 
      min-height: 44px;
    }
    .logo-content { display: flex; align-items: center; gap: 0.85rem; }
    .logo-icon {
      width: 36px; height: 36px;
      background: #1a1d27; color: white;
      border-radius: 10px; display: flex;
      align-items: center; justify-content: center;
      font-size: 1.25rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      flex-shrink: 0;
    }
    .logo-icon.mini { margin: 0 auto; }
    .brand { 
      font-size: 1.25rem; font-weight: 800; 
      color: #1a1d27; letter-spacing: -0.02em; line-height: 1;
    }
    .brand span { 
      display: block; font-size: 0.85rem; color: #ff3366; 
      font-weight: 500; margin-top: 2px; letter-spacing: 0.05em;
    }
    
    .collapse-toggle {
      background: #f1f5f9; border: none; width: 28px; height: 28px;
      border-radius: 8px; cursor: pointer; display: flex; align-items: center;
      justify-content: center; color: #64748b; transition: all 0.3s;
      flex-shrink: 0;
    }
    .collapse-toggle:hover { background: #e2e8f0; color: #1a1d27; }
    .collapse-toggle svg { width: 14px; height: 14px; transition: transform 0.4s; }
    .sidebar.collapsed .collapse-toggle { position: absolute; right: -14px; top: 1.75rem; opacity: 0; }
    .sidebar.collapsed:hover .collapse-toggle { right: 8px; opacity: 1; }
    .sidebar.collapsed .collapse-toggle svg { transform: rotate(180deg); }

    .nav-menu { flex: 1; display: flex; flex-direction: column; gap: 0.4rem; }
    .nav-section { 
      font-size: 0.7rem; font-weight: 700; color: #94a3b8; 
      text-transform: uppercase; letter-spacing: 0.1em; 
      margin: 1.75rem 0 0.75rem 0.75rem; 
    }
    .nav-section-mini { text-align: center; color: #cbd5e1; margin: 1rem 0; font-size: 1.2rem; }

    .nav-item { 
      display: flex; align-items: center; gap: 0.85rem; 
      padding: 0.75rem 0.85rem; border-radius: 12px; 
      color: #64748b; text-decoration: none; 
      font-weight: 600; font-size: 0.925rem; 
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .sidebar.collapsed .nav-item { justify-content: center; padding: 0.75rem 0; }
    .ni-icon { width: 18px; height: 18px; stroke-width: 2.2; flex-shrink: 0; }

    .nav-item:hover { color: #1a1d27; background: #f8fafc; transform: translateX(3px); }
    .sidebar.collapsed .nav-item:hover { transform: scale(1.05); }

    .nav-item.active { background: #fdf2f4; color: #ff3366; }
    .nav-item.active.pos-btn { background: #000; color: #fff; }

    .pos-btn { 
      background: #1a1d27; color: #ffffff !important;
      margin: 1rem 0; box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    }
    .pos-btn .ni-icon { color: #ff3366; }
    .sidebar.collapsed .pos-btn { margin: 1rem 0.5rem; }
    .pos-btn:hover { background: #000; transform: translateY(-2px); }

    .sidebar-footer { padding-top: 1.5rem; border-top: 1px solid #f1f3f9; margin-top: 2rem; }
    .store-link { background: #f1f5f9; color: #475569; }
    .store-link:hover { background: #1a1d27; color: #fff; }
  `]
})
export class SidebarComponent {
  private authService = inject(AuthService);
  public ui = inject(UiService);

  isAdmin() {
    return this.authService.isAdmin();
  }
}
