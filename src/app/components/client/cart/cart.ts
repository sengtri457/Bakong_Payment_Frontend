import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="sc-layout">

      <!-- LEFT: CART ITEMS -->
      <div class="sc-left">
        <div class="sc-heading">
          <h1>Shopping Cart</h1>
          <p class="sc-sub">{{ cartCount() }} {{ cartCount() === 1 ? 'item' : 'items' }} selected for your glow routine</p>
        </div>

        <!-- EMPTY STATE -->
        <div class="sc-empty" *ngIf="cart().length === 0">
          <div class="sc-empty-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Discover our curated collection of clean luxury essentials.</p>
          <button class="sc-continue-btn" (click)="onBackToShop()">Start Shopping</button>
        </div>

        <!-- ITEM CARDS -->
        <div class="sc-item-card" *ngFor="let item of cart()">
          <div class="sc-item-img">
            <img *ngIf="item.product.photo" [src]="item.product.photo" [alt]="item.product.product_name" />
            <div *ngIf="!item.product.photo" class="sc-img-placeholder">✿</div>
          </div>
          <div class="sc-item-body">
            <div class="sc-item-top">
              <div class="sc-item-meta">
                <h3 class="sc-item-name">{{ item.product.product_name }}</h3>
                <p class="sc-item-variant">{{ item.product.volume || '30ml' }} | {{ item.product.description ? item.product.description.split(' ').slice(0,2).join(' ') : 'Clean Beauty' }}</p>
              </div>
              <button class="sc-trash-btn" (click)="removeFromCart(item.product._id, item.size)" title="Remove item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </button>
            </div>
            <div class="sc-item-bottom">
              <div class="sc-qty-row">
                <button class="sc-qty-btn" (click)="changeQty(item.product._id, item.size, -1)">−</button>
                <span class="sc-qty-num">{{ item.quantity }}</span>
                <button class="sc-qty-btn" (click)="changeQty(item.product._id, item.size, 1)">+</button>
              </div>
              <span class="sc-item-price">\${{ (item.product.unit_price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: ORDER SUMMARY -->
      <div class="sc-right" *ngIf="cart().length > 0">
        <div class="sc-summary-card">
          <h2 class="sc-summary-title">Order Summary</h2>

          <div class="sc-summary-rows">
            <div class="sc-summary-row">
              <span>Subtotal</span>
              <span>\${{ total().toFixed(2) }}</span>
            </div>
            <div class="sc-summary-row">
              <span>Shipping</span>
              <span>\$0.00</span>
            </div>
            <div class="sc-summary-row">
              <span>Tax</span>
              <span>\$0.00</span>
            </div>
          </div>

          <div class="sc-summary-total">
            <span>Total</span>
            <span class="sc-total-val">\${{ (total() + 0.00).toFixed(2) }}</span>
          </div>

          <!-- PROMO CODE -->
          <div class="sc-promo-label">PROMO CODE</div>
          <div class="sc-promo-row">
            <input type="text" class="sc-promo-input" placeholder="Glow2024" [(ngModel)]="promoCode" />
            <button class="sc-promo-apply">Apply</button>
          </div>

          <!-- CTA -->
          <button class="sc-checkout-btn" (click)="onProceedToCheckout()">
            Proceed to Checkout
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:16px"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>

          <!-- TRUST -->
          <div class="sc-trust">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px; color:#888"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span>Secure SSL Encrypted Checkout</span>
          </div>
          <div class="sc-payment-icons">
            <div class="sc-pay-icon"></div>
            <div class="sc-pay-icon"></div>
            <div class="sc-pay-icon"></div>
          </div>
        </div>

        <!-- CONTINUE SHOPPING -->
        <button class="sc-continue-link" (click)="onBackToShop()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Continue Shopping
        </button>
      </div>

    </div>
  `,
  styleUrl: './cart.css'
})
export class CartComponent {
  cartService = inject(CartService);

  cart = this.cartService.cart;
  cartCount = this.cartService.cartCount;
  total = this.cartService.total;
  promoCode = '';

  @Output() proceedCheckout = new EventEmitter<void>();
  @Output() backShop = new EventEmitter<void>();

  changeQty(id: string, size: string | undefined, delta: number) {
    this.cartService.changeQty(id, size, delta);
  }

  removeFromCart(id: string, size: string | undefined) {
    this.cartService.removeFromCart(id, size);
  }

  onProceedToCheckout() {
    this.proceedCheckout.emit();
  }

  onBackToShop() {
    this.backShop.emit();
  }
}
