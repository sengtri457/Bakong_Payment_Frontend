import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="promo-strip-glow">
      <span>COMPLIMENTARY SHIPPING ON ALL SUMMER RITUALS</span>
      <span class="sep">|</span>
      <a routerLink="/collection" [queryParams]="{filter: 'best'}">SHOP BEST SELLERS</a>
    </div>

    <nav class="store-nav-luxe">
      <div class="nav-container">
        <!-- BRAND -->
        <div class="nav-brand-luxe" routerLink="/store">
          <span class="brand-text">2R3NY</span>
        </div>

        <!-- CENTERED LINKS -->
        <div class="nav-links">
          <a routerLink="/store" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
          <a routerLink="/collection" routerLinkActive="active">Collection</a>
          <a routerLink="/skincare" routerLinkActive="active">Skincare</a>
          <a routerLink="/makeup" routerLinkActive="active">MakeUp</a>
          <a routerLink="/fragrance" routerLinkActive="active">Fragrance</a>
        </div>

        <!-- ACTIONS -->
        <div class="user-actions">

          <button class="cart-glow-btn" (click)="onCartClick()" style="background: none; border: none; cursor: pointer; position: relative; color: var(--glow-text); padding: 5px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width: 22px;">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span class="cart-dot" *ngIf="cartCount() > 0" style="position: absolute; top: 0; right: 0; width: 9px; height: 9px; background: var(--glow-accent); border-radius: 50%; border: 2px solid white;"></span>
          </button>
          
          <button class="join-btn-luxe outline" *ngIf="user()?.role === 'admin'" routerLink="/dashboard" style="margin-right: 0.5rem; border-color: var(--primary); color: var(--primary);">Dashboard</button>
          <button class="join-btn-luxe" *ngIf="!user()" (click)="login()">SIGN IN</button>
          <button class="join-btn-luxe outline" *ngIf="user()" (click)="logout()">LOGOUT</button>
        </div>
      </div>
    </nav>
  `,
  styleUrl: '../store/store.css'
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private router = inject(Router);

  user = this.authService.currentUser;
  cartCount = this.cartService.cartCount;
  searchQuery = '';

  login() { this.router.navigate(['/login']); }
  logout() { this.authService.logout(); }
  onCartClick() { this.router.navigate(['/store'], { fragment: 'cart' }); }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/collection'], { queryParams: { q: this.searchQuery.trim() } });
      this.searchQuery = '';
    }
  }
}
