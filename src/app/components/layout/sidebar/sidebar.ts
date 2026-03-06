import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  standalone: true,
  template: `
    <aside class="sidebar">
      <div class="logo-area">
        <span class="icon">📦</span>
        <span class="brand">StockFlow</span>
      </div>
      
      <nav class="nav-menu">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">📊</span> Dashboard
        </a>
        <a routerLink="/pos" routerLinkActive="active" class="nav-item pos-link">
          <span class="nav-icon">🛒</span> Point of Sale
        </a>
        <a routerLink="/store" class="nav-item" target="_blank">
          <span class="nav-icon">🌍</span> Client Storefront
        </a>
        
        <div class="nav-section">INVENTORY</div>
        <a routerLink="/products" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">🏷️</span> Products
        </a>
        <a routerLink="/categories" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">📁</span> Categories
        </a>
        
        <div class="nav-section">PARTNERS</div>
        <a routerLink="/suppliers" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">🚚</span> Suppliers
        </a>
        <a routerLink="/customers" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">👥</span> Customers
        </a>
        
        <div class="nav-section">REPORTS</div>
        <a routerLink="/sales" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">📈</span> Sales History
        </a>
      </nav>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      height: 100vh;
      background: var(--surface, #1a1d27);
      border-right: 1px solid var(--border, #2e3349);
      display: flex;
      flex-direction: column;
      padding: 1.5rem 1rem;
      flex-shrink: 0;
    }
    .logo-area {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0 0.5rem 2rem;
    }
    .logo-area .icon {
      font-size: 1.75rem;
    }
    .logo-area .brand {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--accent, #4f8ef7);
      letter-spacing: -0.5px;
    }
    .nav-menu {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .nav-section {
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--muted, #8892b0);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin: 1.25rem 0 0.25rem 0.5rem;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      color: var(--text, #e4e8f5);
      text-decoration: none;
      font-weight: 500;
      font-size: 0.9rem;
      transition: all 0.2s ease;
    }
    .nav-item:hover {
      background: var(--surface2, #23273a);
      color: #fff;
    }
    .nav-item.active {
      background: linear-gradient(135deg, rgba(79, 142, 247, 0.15), rgba(124, 92, 252, 0.15));
      color: var(--accent, #4f8ef7);
      font-weight: 600;
      border-left: 3px solid var(--accent, #4f8ef7);
    }
    .pos-link {
      background: linear-gradient(135deg, var(--accent, #4f8ef7), var(--accent2, #7c5cfc));
      color: white !important;
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
      box-shadow: 0 4px 15px rgba(79, 142, 247, 0.3);
    }
    .pos-link:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
    .nav-icon {
      font-size: 1.2rem;
      opacity: 0.9;
    }
  `]
})
export class Sidebar {}
