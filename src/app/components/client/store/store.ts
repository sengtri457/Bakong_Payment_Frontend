import { Component, OnInit, signal, computed, inject, PLATFORM_ID, OnDestroy, ViewEncapsulation } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as QRCode from 'qrcode';
import { BakongService, Product, GenerateQRResponse } from '../../../services/bakong.service';
import { AuthService } from '../../../services/auth.service';

interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
}

type PageState = 'shop' | 'detail' | 'qr' | 'success' | 'expired';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, FormsModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="store-wrapper">
      <!-- Minimal Store Navigation -->
      <nav class="store-nav">
        <div class="nav-brand">
          <span class="icon">✨</span>
          <span class="brand-text">Aura Clothing</span>
        </div>
        <div class="nav-actions">
          <label class="currency-toggle">
            <span [class.active]="currency() === 'usd'" (click)="currency.set('usd')">USD $</span>
            <span class="sep">|</span>
            <span [class.active]="currency() === 'khr'" (click)="currency.set('khr')">KHR ៛</span>
          </label>
          <ng-container *ngIf="user()">
            <button class="cart-btn" (click)="toggleCart()" title="View Cart">
              Cart <span class="cart-badge" *ngIf="cartCount() > 0">{{ cartCount() }}</span>
            </button>
            <button *ngIf="isAdmin()" class="cart-btn" (click)="router.navigate(['/dashboard'])" style="color:var(--aura-primary)" title="Admin Dashboard">
              Admin Dashboard
            </button>
            <button class="cart-btn" (click)="logout()" style="color:var(--aura-cta)" title="Logout">
              Logout
            </button>
          </ng-container>
          <ng-container *ngIf="!user()">
            <button class="cart-btn" (click)="login()">
              Sign In / Register to Buy
            </button>
          </ng-container>
        </div>
      </nav>

      <main class="store-content" *ngIf="pageState() === 'shop'">
        <!-- Hero Section -->
        <section class="hero-section">
          <div class="hero-content">
            <h1>Elevate Your Style.</h1>
            <p>Discover premium luxury clothing crafted for the modern individual.</p>
          </div>
        </section>

        <!-- Product Grid -->
        <section class="products-section">
          <div class="section-header">
            <h2>The Collection</h2>
          </div>

          <div *ngIf="loading() && products().length === 0" class="product-grid">
            <div *ngFor="let s of [1,2,3,4,5,6]" class="skeleton-card"></div>
          </div>

          <div *ngIf="!loading() && products().length === 0" class="empty-state">
            <div class="empty-icon">😔</div>
            <h3>Collection is empty</h3>
            <p>Please check back later for new arrivals</p>
          </div>

          <div class="product-grid" *ngIf="products().length > 0">
            <div class="card product-card" *ngFor="let p of products()">
              <div class="product-image-wrapper" (click)="viewProduct(p)" style="cursor: pointer;">
                <div class="product-image-placeholder">
                  <img *ngIf="p.photo" [src]="p.photo" [alt]="p.product_name" class="real-product-image" />
                  <div *ngIf="!p.photo" class="placeholder-content">Aura</div>
                  <span class="img-badge" *ngIf="p.quantity_in_stock < 5 && p.quantity_in_stock > 0">Limited</span>
                  <span class="img-badge out" *ngIf="p.quantity_in_stock === 0">Sold Out</span>
                </div>
                <!-- We will rely on the detail page to Buy, or we can keep hovering too. 
                     If the user clicks on the image, we navigate. If they click Add to Cart, we stop propagation. -->
                <div class="hover-overlay" (click)="$event.stopPropagation()">
                  <ng-container *ngIf="p.quantity_in_stock > 0">
                    <ng-container *ngIf="user(); else loginToBuy">
                      <button class="btn-primary" (click)="viewProduct(p)">{{ (p.sizes?.length || 0) > 0 ? 'Select Size' : 'View Item' }}</button>
                    </ng-container>
                    <ng-template #loginToBuy>
                      <button class="btn-primary" (click)="login()">Login to Buy</button>
                    </ng-template>
                  </ng-container>
                  <button *ngIf="p.quantity_in_stock === 0" class="btn-primary disabled" disabled>Out of Stock</button>
                </div>
              </div>

              <div class="product-info" (click)="viewProduct(p)" style="cursor: pointer;">
                <h3>{{ p.product_name }}</h3>
                <p class="desc">{{ p.description || 'Exclusive luxury item' }}</p>
                <div class="price">
                  <span *ngIf="currency() === 'usd'">\${{ p.unit_price.toFixed(2) }}</span>
                  <span *ngIf="currency() === 'khr'">{{ (p.unit_price * 4100) | number:'1.0-0' }} ៛</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- Product Detail View -->
      <main class="store-content detail-view" *ngIf="pageState() === 'detail' && selectedProduct()">
        <div class="breadcrumb">
          <a (click)="backToShop()">HOME</a> / <a (click)="backToShop()">COLLECTION</a> / <span>{{ selectedProduct()?.product_name | uppercase }}</span>
        </div>
        
        <div class="detail-grid">
          <div class="detail-gallery">
            <div class="thumbnails-col" *ngIf="(selectedProduct()?.gallery_photos?.length || 0) > 0">
              <div class="thumb-wrapper" [class.active]="selectedImage() === selectedProduct()?.photo" (click)="selectedImage.set(selectedProduct()?.photo || null)">
                 <img *ngIf="selectedProduct()?.photo" [src]="selectedProduct()?.photo" />
                 <span *ngIf="!selectedProduct()?.photo">MAIN</span>
              </div>
              <div class="thumb-wrapper" *ngFor="let gImg of selectedProduct()?.gallery_photos" [class.active]="selectedImage() === gImg" (click)="selectedImage.set(gImg)">
                 <img [src]="gImg" />
              </div>
            </div>
            <div class="detail-main-image">
              <img *ngIf="selectedImage()" [src]="selectedImage()" [alt]="selectedProduct()?.product_name" />
              <div *ngIf="!selectedImage()" class="placeholder-large">Aura Clothing</div>
            </div>
          </div>
          
          <div class="detail-info">
            <div class="detail-code">Item: {{ selectedProduct()?.product_code }}</div>
            <h1 class="detail-title">{{ selectedProduct()?.product_name }}</h1>
            <div class="detail-price">
              <span *ngIf="currency() === 'usd'">\${{ selectedProduct()?.unit_price?.toFixed(2) }}</span>
              <span *ngIf="currency() === 'khr'">{{ ((selectedProduct()?.unit_price || 0) * 4100) | number:'1.0-0' }} ៛</span>
            </div>
            
            <p class="detail-desc">{{ selectedProduct()?.description || 'Exclusive premium clothing piece brought to you by Aura.' }}</p>

            <div class="size-selector" *ngIf="(selectedProduct()?.sizes?.length || 0) > 0">
              <span class="size-label">Size: <span class="selected-size-text">{{ selectedSize() || 'Select a size' }}</span></span>
              <div class="size-options">
                <button *ngFor="let s of selectedProduct()?.sizes" 
                        class="size-btn" 
                        [class.active]="selectedSize() === s" 
                        (click)="selectedSize.set(s)">{{ s }}</button>
              </div>
            </div>

            <div class="detail-status">
               <div class="status-indicator" [class.low]="selectedProduct()!.quantity_in_stock < 5" [class.out]="selectedProduct()!.quantity_in_stock === 0"></div>
               <span *ngIf="selectedProduct()!.quantity_in_stock > 5">In Stock ({{ selectedProduct()?.quantity_in_stock }} available)</span>
               <span *ngIf="selectedProduct()!.quantity_in_stock > 0 && selectedProduct()!.quantity_in_stock <= 5">Limited Stock ({{ selectedProduct()?.quantity_in_stock }} left!)</span>
               <span *ngIf="selectedProduct()!.quantity_in_stock === 0">Out of Stock</span>
            </div>

            <div class="detail-actions">
              <ng-container *ngIf="selectedProduct()!.quantity_in_stock > 0">
                <ng-container *ngIf="user(); else loginDetail">
                  
                  <button class="btn-primary massive-btn" 
                          *ngIf="!getCartItem(selectedProduct()!._id, selectedSize())" 
                          [disabled]="(selectedProduct()?.sizes?.length || 0) > 0 && !selectedSize()"
                          (click)="addToCart(selectedProduct()!)">
                    {{ (selectedProduct()?.sizes?.length || 0) > 0 && !selectedSize() ? 'Select a Size' : 'Add to Cart' }}
                  </button>
                  
                  <div class="qty-control large" *ngIf="getCartItem(selectedProduct()!._id, selectedSize())">
                    <button (click)="changeQty(selectedProduct()!._id, getCartItem(selectedProduct()!._id, selectedSize())?.size, -1)">-</button>
                    <span>{{ getCartItem(selectedProduct()!._id, selectedSize())!.quantity }} in Cart</span>
                    <button (click)="changeQty(selectedProduct()!._id, getCartItem(selectedProduct()!._id, selectedSize())?.size, 1)" [disabled]="getCartItem(selectedProduct()!._id, selectedSize())!.quantity >= selectedProduct()!.quantity_in_stock">+</button>
                  </div>
                
                </ng-container>
                <ng-template #loginDetail>
                  <button class="btn-primary massive-btn" (click)="login()">Login to Purchase</button>
                </ng-template>
              </ng-container>
              
              <button class="btn-primary massive-btn disabled" *ngIf="selectedProduct()!.quantity_in_stock === 0" disabled>
                Sold Out
              </button>
            </div>
          </div>
        </div>
      </main>

      <!-- Cart Drawer -->
      <div class="cart-drawer" [class.open]="isCartOpen()">
        <div class="cart-header">
          <h2>Your Cart</h2>
          <button class="close-btn" (click)="toggleCart()">✕</button>
        </div>
        
        <div class="cart-body">
          <div *ngIf="cart().length === 0" class="empty-cart">
            <p>Your cart is empty</p>
          </div>
          
          <div class="cart-items" *ngIf="cart().length > 0">
            <div class="cart-item" *ngFor="let item of cart()">
              <div class="item-icon">
                <img *ngIf="item.product.photo" [src]="item.product.photo" class="mini-cart-img"/>
                <span *ngIf="!item.product.photo">Aura</span>
              </div>
              <div class="item-details">
                <h4>{{ item.product.product_name }}</h4>
                <div class="item-size" *ngIf="item.size" style="font-size:0.85rem; color:#64748b; margin-top:-4px; margin-bottom:4px;">Size: {{item.size}}</div>
                <div class="item-price">
                  <span *ngIf="currency() === 'usd'">\${{ item.product.unit_price.toFixed(2) }}</span>
                  <span *ngIf="currency() === 'khr'">{{ (item.product.unit_price * 4100) | number:'1.0-0' }} ៛</span>
                </div>
              </div>
              <div class="item-actions">
                <div class="qty-mini">
                  <button (click)="changeQty(item.product._id, item.size, -1)">-</button>
                  <span>{{ item.quantity }}</span>
                  <button (click)="changeQty(item.product._id, item.size, 1)" [disabled]="item.quantity >= item.product.quantity_in_stock">+</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="cart-footer" *ngIf="cart().length > 0">
          <div class="cart-total">
            <span>Subtotal</span>
            <span class="amount">{{ totalDisplay() }}</span>
          </div>
          <button class="btn-primary checkout-btn" (click)="generateQR()" [disabled]="loading()">
            <span *ngIf="loading()" class="spinner-mini"></span>
            Checkout with Bakong
          </button>
        </div>
      </div>
      <div class="drawer-backdrop" *ngIf="isCartOpen()" (click)="toggleCart()"></div>

      <!-- Payment Overlays (QR / Success / Expired) -->
      <div class="payment-overlay" *ngIf="['qr', 'success', 'expired'].includes(pageState())">
        
        <div class="modal qr-card" *ngIf="pageState() === 'qr'">
          <div class="qr-header">
            <h2>Complete Payment</h2>
            <p>Scan securely with your Bakong app</p>
          </div>
          <div class="qr-image-wrapper" [class.paid]="pollStatus() === 'paid'">
            <img *ngIf="qrDataUrl()" [src]="qrDataUrl()" alt="Bakong QR" />
            <div class="qr-loading" *ngIf="!qrDataUrl()">Generating...</div>
            <div class="paid-check" *ngIf="pollStatus() === 'paid'">✓</div>
          </div>
          <div class="qr-amount">{{ totalDisplay() }}</div>
          
          <div class="qr-status-row">
            <div class="countdown" [class.urgent]="secondsLeft() < 120">⏱ {{ countdown() }}</div>
            <div class="poll-status" [class]="'poll-' + pollStatus()">{{ pollMessage() }}</div>
          </div>
          
          <a class="cancel-link" (click)="startOver()">Cancel Order</a>
        </div>

        <div class="modal result-card" *ngIf="pageState() === 'success'">
          <div class="icon-success">✓</div>
          <h2>Payment Successful</h2>
          <p>Your premium order has been confirmed.</p>
          <button class="btn-primary" (click)="startOver()">Continue Shopping</button>
        </div>

        <div class="modal result-card" *ngIf="pageState() === 'expired'">
          <div class="icon-expired">✕</div>
          <h2>Payment Expired</h2>
          <p>The time limit to pay has passed.</p>
          <button class="btn-secondary" (click)="startOver()">Return to Store</button>
        </div>

      </div>

    </div>
  `,
  styles: [`
    .real-product-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
    }
    .placeholder-content {
      z-index: 0;
    }
    .img-badge { z-index: 2 !important; }
    .mini-cart-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
    }

    /* Product Detail Overrides */
    .detail-view { padding: 2rem 4% !important; max-width: 1440px; margin: 0 auto; }
    
    .breadcrumb { font-size: 0.85rem; color: #64748b; margin-bottom: 2rem; letter-spacing: 0.5px; text-transform: uppercase; font-weight: 500; }
    .breadcrumb a { color: var(--aura-primary, #2563eb); cursor: pointer; transition: color 0.2s; }
    .breadcrumb a:hover { color: var(--aura-text); text-decoration: underline; }
    
    .detail-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 4rem;
      align-items: start;
    }
    @media (max-width: 1024px) {
      .detail-grid { grid-template-columns: 1fr; gap: 3rem; }
    }
    
    .detail-gallery {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
      position: sticky;
      top: 100px;
    }
    .thumbnails-col {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      width: 60px;
    }
    .thumb-wrapper {
      width: 60px;
      height: 75px;
      border-radius: 6px;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.2s;
      background: #f8fafc;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.6rem; color: #94a3b8;
    }
    .thumb-wrapper img { width: 100%; height: 100%; object-fit: cover; }
    .thumb-wrapper:hover { border-color: #cbd5e1; }
    .thumb-wrapper.active { border-color: var(--aura-text); }
    
    .detail-main-image {
      flex: 1;
      aspect-ratio: 3/4;
      background: #f1f5f9;
      border-radius: 12px;
      overflow: hidden;
    }
    .detail-main-image img {
      width: 100%; height: 100%; object-fit: cover;
    }
    .placeholder-large {
      display: flex; align-items: center; justify-content: center;
      width: 100%; height: 100%; color: #94a3b8; font-size: 2rem; font-weight: 300; background: #f1f5f9;
    }
    
    .detail-info {
      padding-top: 1rem;
    }
    .detail-code { color: var(--aura-primary, #2563EB); font-family: monospace; font-size: 0.9rem; letter-spacing: 1px; margin-bottom: 0.5rem; }
    .detail-title { font-size: 2.5rem; font-weight: 700; margin: 0 0 1rem 0; line-height: 1.2; color: var(--aura-text); font-family: var(--aura-heading-font); }
    .detail-price { font-size: 1.75rem; color: var(--aura-text); font-weight: 400; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 1rem; }
    .detail-desc { font-size: 1.05rem; color: #475569; line-height: 1.6; margin-bottom: 2.5rem; }
    .detail-status { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; color: var(--aura-text); font-size: 0.95rem; }
    .status-indicator { width: 8px; height: 8px; border-radius: 50%; background: #10b981; }
    .status-indicator.low { background: #f59e0b; }
    .status-indicator.out { background: #ef4444; }
    
    .detail-actions { display: flex; flex-direction: column; gap: 1rem; }
    
    .size-selector { margin-bottom: 2rem; }
    .size-label { display: block; font-size: 0.95rem; font-weight: 500; color: #475569; margin-bottom: 1rem; }
    .selected-size-text { color: var(--aura-text); font-weight: 700; margin-left: 0.5rem; }
    .size-options { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .size-btn { 
      min-width: 60px; height: 45px; background: white; border: 1px solid #cbd5e1; 
      border-radius: 4px; font-weight: 600; cursor: pointer; transition: all 0.2s;
      display: flex; align-items: center; justify-content: center;
      color: var(--aura-text);
    }
    .size-btn:hover { border-color: var(--aura-text); }
    .size-btn.active { border-color: var(--aura-text); background: var(--aura-text); color: white; }

    .massive-btn { padding: 1.25rem; font-size: 1rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; border-radius: 6px; border: none; background: #1e293b; color: white; cursor: pointer; transition: 0.2s;}
    .massive-btn:hover { background: #334155; }
    .massive-btn.disabled { background: #cbd5e1; cursor: not-allowed; }
    
    .qty-control.large { display: flex; justify-content: space-between; align-items: center; background: white; border: 1px solid #e2e8f0; padding: 0.5rem; border-radius: 12px; }
    .qty-control.large span { font-size: 1.1rem; font-weight: 600; color: var(--aura-text); }
    .qty-control.large button { width: 50px; height: 50px; background: #f1f5f9; color: var(--aura-text); border: none; border-radius: 8px; font-size: 1.5rem; cursor: pointer; transition: 0.2s; }
    .qty-control.large button:hover:not([disabled]) { background: var(--aura-text); color: #fff; }
    .qty-control.large button[disabled] { opacity: 0.3; cursor: not-allowed; }
  `],
  styleUrl: './store.css'
})
export class StoreComponent implements OnInit, OnDestroy {
  private bakongService = inject(BakongService);
  private authService = inject(AuthService);
  router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  
  user = this.authService.currentUser;

  // States
  pageState = signal<PageState>('shop');
  selectedProduct = signal<Product | null>(null);
  selectedImage = signal<string | null>(null);
  selectedSize = signal<string | null>(null);
  isCartOpen = signal(false);
  products = signal<Product[]>([]);
  cart = signal<CartItem[]>([]);
  loading = signal(false);
  error = signal('');
  currency = signal<'usd' | 'khr'>('usd');
  
  // Payment States
  qrData = signal<GenerateQRResponse | null>(null);
  qrDataUrl = signal('');
  pollStatus = signal<'idle' | 'polling' | 'paid' | 'expired'>('idle');
  pollMessage = signal('Waiting for payment…');
  saleResult = signal<any>(null);
  secondsLeft = signal(900);
  
  private pollInterval: any;
  private countdownInterval: any;
  readonly TEST_USER_ID = '000000000000000000000001';

  // Computeds
  total = computed(() => this.cart().reduce((sum, i) => sum + i.product.unit_price * i.quantity, 0));
  cartCount = computed(() => this.cart().reduce((sum, i) => sum + i.quantity, 0));
  totalDisplay = computed(() => {
    const t = this.total();
    return this.currency() === 'usd' ? `$${t.toFixed(2)}` : `${Math.round(t * 4100).toLocaleString()} ៛`;
  });
  countdown = computed(() => {
    const m = Math.floor(this.secondsLeft() / 60).toString().padStart(2, '0');
    const s = (this.secondsLeft() % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  });

  ngOnInit() { this.loadProducts(); }
  ngOnDestroy() { this.stopPolling(); }

  login() {
    this.router.navigate(['/login']);
  }

  logout() {
    this.authService.logout();
  }

  isAdmin() {
    return this.authService.isAdmin();
  }

  toggleCart() { this.isCartOpen.update(v => !v); }

  viewProduct(product: Product) {
    this.selectedProduct.set(product);
    this.selectedImage.set(product.photo || null);
    this.selectedSize.set(null);
    this.pageState.set('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  backToShop() {
    this.selectedProduct.set(null);
    this.pageState.set('shop');
  }

  loadProducts() {
    this.loading.set(true);
    this.bakongService.getProducts().subscribe({
      next: (res: any) => { this.products.set(res.data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  addToCart(product: Product) {
    const existing = this.cart().find(i => i.product._id === product._id && i.size === this.selectedSize());
    if (existing) {
      if (existing.quantity >= product.quantity_in_stock) return;
      this.cart.update(c => c.map(i => (i.product._id === product._id && i.size === this.selectedSize()) ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      this.cart.update(c => [...c, { product, quantity: 1, size: this.selectedSize() || undefined }]);
    }
  }

  changeQty(productId: string, size: string | undefined, delta: number) {
    this.cart.update(c => c.map(i => {
      if (i.product._id !== productId || i.size !== size) return i;
      const newQty = i.quantity + delta;
      return newQty <= 0 ? null : { ...i, quantity: Math.min(newQty, i.product.quantity_in_stock) };
    }).filter(Boolean) as CartItem[]);
  }

  getCartItem(productId: string, size?: string | null): CartItem | undefined {
    return this.cart().find(i => i.product._id === productId && i.size === (size || undefined));
  }

  generateQR() {
    if (this.cart().length === 0) return;
    this.loading.set(true);
    this.error.set('');

    const currentUserId = this.user()?.id || this.TEST_USER_ID;

    const payload = {
      userId: currentUserId,
      currency: this.currency(),
      items: this.cart().map(i => ({ product_id: i.product._id, quantity: i.quantity })),
      notes: 'Store checkout',
    };

    this.bakongService.generateQR(payload).subscribe({
      next: (res: GenerateQRResponse) => {
        this.qrData.set(res);
        this.secondsLeft.set(900);
        this.isCartOpen.set(false);

        if (isPlatformBrowser(this.platformId)) {
          QRCode.toDataURL(res.qrString, { width: 300, margin: 2 })
            .then(url => this.qrDataUrl.set(url))
            .catch(err => console.error(err));
        }

        this.pageState.set('qr');
        this.loading.set(false);
        this.startPolling(res.sessionId);
        this.startCountdown();
      },
      error: () => this.loading.set(false)
    });
  }

  private startPolling(sessionId: string) {
    this.pollStatus.set('polling');
    this.pollMessage.set('Waiting for payment…');

    this.pollInterval = setInterval(() => {
      this.bakongService.checkPayment(sessionId).subscribe({
        next: (res: any) => {
          if (res.isPaid) {
            this.saleResult.set(res.sale);
            this.pollStatus.set('paid');
            this.pollMessage.set('Payment confirmed! 🎉');
            this.stopPolling();
            setTimeout(() => this.pageState.set('success'), 1000);
          } else if (res.message?.includes('expired')) {
            this.pollStatus.set('expired');
            this.pollMessage.set('QR expired.');
            this.stopPolling();
            this.pageState.set('expired');
          }
        },
        error: () => {}
      });
    }, 3000);
  }

  private stopPolling() {
    clearInterval(this.pollInterval);
    clearInterval(this.countdownInterval);
  }

  private startCountdown() {
    this.countdownInterval = setInterval(() => {
      this.secondsLeft.update(s => {
        if (s <= 1) {
          this.stopPolling();
          if (this.pageState() === 'qr') this.pageState.set('expired');
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  startOver() {
    this.stopPolling();
    this.cart.set([]);
    this.qrData.set(null);
    this.qrDataUrl.set('');
    this.pollStatus.set('idle');
    this.pageState.set('shop');
    this.loadProducts();
  }
}
