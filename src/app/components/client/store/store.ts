import { Component, OnInit, OnDestroy, signal, computed, inject, ViewEncapsulation, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import * as QRCode from 'qrcode';
import { BakongService, GenerateQRResponse, Product } from '../../../services/bakong.service';
import { AuthService } from '../../../services/auth.service';
import { ApiService } from '../../../services/api.service';
import { CartService } from '../../../services/cart.service';
import { NavbarComponent } from '../navbar/navbar';
import { CartComponent } from '../cart/cart';
import Swal from 'sweetalert2';

type PageState = 'shop' | 'detail' | 'qr' | 'success' | 'expired' | 'cart' | 'checkout';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, CartComponent],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="store-wrapper">
      <app-navbar *ngIf="pageState() !== 'checkout' && pageState() !== 'qr'"></app-navbar>

      <!-- CHECKOUT NAV -->
      <nav class="chk-nav" *ngIf="pageState() === 'checkout' || pageState() === 'qr'">
        <div class="chk-nav-container">
          <div class="nav-brand-luxe" (click)="backToShop()" style="cursor: pointer;">
            <span class="brand-text">Glow Studio</span>
          </div>
          <div class="checkout-steps-glow">
            <span class="step" [class.active]="pageState() === 'checkout'">CHECKOUT</span>
            <span class="separator">›</span>
            <span class="step" [class.active]="pageState() === 'qr'">PAYMENT</span>
          </div>
          <div class="user-actions">
             <button class="join-btn-luxe outline" style="padding: 0.5rem 1.5rem;" (click)="backToShop()">Cancel</button>
          </div>
        </div>
      </nav>

      <!-- PAGE: HOME / SHOP -->
      <main class="landing-luxe fade-in mt-3" *ngIf="pageState() === 'shop'">
        <header class="hero-split-luxe fade-in">
          <div class="hero-content-left">
             <span class="hero-label-luxe">NEW SUMMER RADIANCE 2024</span>
             <h1 class="hero-main-title">Elevate Your <span>Natural Glow</span></h1>
             <p class="hero-main-desc">Experience the pinnacle of ethical luxury with our meticulously crafted clean beauty essentials designed for every skin tone.</p>
             <div class="hero-actions-row">
                <button class="btn-ritual-primary" (click)="activeFilter.set('all')">Shop the Collection</button>
                <button class="btn-ritual-outline">Explore Story</button>
             </div>
          </div>
          <div class="hero-img-right">
             <img src="https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800" alt="Signature Serum" />
          </div>
        </header>

        <!-- CURATED EDIT -->
        <section class="section-luxe" *ngIf="loading() || bestSellers().length > 0">
          <div class="section-header-luxe">
            <div>
              <h2>The Curated Edit</h2>
              <p>Essential rituals for a timeless routine.</p>
            </div>
            <a class="view-all-link" routerLink="/collection" (click)="activeFilter.set('all')">View All →</a>
          </div>

          <!-- SKELETON WIREFRAME -->
          <div class="luxe-grid" *ngIf="loading()">
            <div class="luxe-card" *ngFor="let s of [1,2,3,4]">
              <div class="skeleton-box skeleton-img"></div>
              <div class="luxe-card-info">
                 <div class="skeleton-box skeleton-text title"></div>
                 <div class="skeleton-box skeleton-text price"></div>
                 <div class="skeleton-box skeleton-text desc"></div>
              </div>
            </div>
          </div>

          <!-- REAL DATA -->
          <div class="luxe-grid" *ngIf="!loading()">
            <div class="luxe-card" *ngFor="let p of bestSellers().slice(0, 4); let i = index" (click)="viewProduct(p)">
              <div class="luxe-img-box">
                <div class="luxe-badge" *ngIf="i % 2 === 0">Essential</div>
                <div class="luxe-wishlist">❤</div>
                <img *ngIf="p.photo" [src]="p.photo" [alt]="p.product_name" class="fade-in" />
                <span *ngIf="!p.photo" style="font-size:3rem; opacity:0.1; font-weight:900">{{ p.product_name.charAt(0) }}</span>
              </div>
              <div class="luxe-card-info">
                <h3>{{ p.product_name }}</h3>
                <div class="price">\${{ p.unit_price.toFixed(2) }}</div>
                <span class="category">{{ p.description || 'Clean Beauty' }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- LUXE STANDARD SECTION -->
        <section class="luxe-standard-split section-luxe">
           <div class="standard-images-grid">
              <div class="standard-img-box tall">
                 <img src="https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800" alt="Lifestyle" />
              </div>
              <div class="standard-img-box short">
                 <img src="https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800" alt="Product Reveal" />
              </div>
           </div>
           <div class="standard-text-col">
              <h2>The Luxe Standard</h2>
              <p>We believe beauty should be as kind as it is powerful. Our commitment to purity ensures your skin receives only the finest botanical ingredients, ethically sourced and scientifically proven to perform.</p>
              
              <ul class="feature-list-luxe">
                 <li class="feature-item-luxe">
                    <div class="feature-icon-circle">✨</div>
                    <div>
                       <h4>100% Clean Ingredients</h4>
                       <p>Free from parabens, sulfates, and synthetic fragrances. Always.</p>
                    </div>
                 </li>
                 <li class="feature-item-luxe">
                    <div class="feature-icon-circle">🌿</div>
                    <div>
                       <h4>Sustainable Packaging</h4>
                       <p>Recyclable glass and FSC-certified paper for a healthier planet.</p>
                    </div>
                 </li>
                 <li class="feature-item-luxe">
                    <div class="feature-icon-circle">🐰</div>
                    <div>
                       <h4>Cruelty-Free Certified</h4>
                       <p>Leaping Bunny certified, never tested on animals at any stage.</p>
                    </div>
                 </li>
              </ul>
           </div>
        </section>


        <!-- NEWSLETTER (LUXE) -->
        <section class="newsletter-glow section-luxe">
           <div class="newsletter-card-glow">
              <h2>Join the Circle</h2>
              <p>Sign up for early access to our Summer rituals and a 15% glow-up bonus.</p>
              <div class="newsletter-form-glow">
                 <input type="email" placeholder="Email Address" class="luxe-input" aria-label="Subscribe to our newsletter" />
                 <button class="btn-luxe-primary">Subscribe</button>
              </div>
           </div>
        </section>

        <!-- FOOTER (RESTORED) -->
        <footer class="footer-glow">
           <div class="footer-grid-glow">
              <div class="footer-brand-col">
                 <div class="brand-text">Glow Studio</div>
                 <p>Defining the future of clean, ethical luxury skincare.</p>
              </div>
              <div class="footer-link-col">
                 <h4>Shop</h4>
                 <a (click)="activeFilter.set('all')">Face</a>
                 <a (click)="activeFilter.set('all')">Body</a>
                 <a (click)="activeFilter.set('all')">Sets</a>
              </div>
              <div class="footer-link-col">
                 <h4>About</h4>
                 <a>Philosophy</a>
                 <a>Sustainability</a>
                 <a>Stockists</a>
              </div>
              <div class="footer-link-col">
                 <h4>Support</h4>
                 <a>Shipping</a>
                 <a>Returns</a>
                 <a>Contact</a>
              </div>
           </div>
           <div class="footer-bottom-glow">
              <p>© 2026 Glow Studio. All Rights Reserved.</p>
              <div class="footer-socials">
                 <span>IG</span> <span>FB</span> <span>TT</span>
              </div>
           </div>
        </footer>
      </main>

      <!-- PAGE: PRODUCT DETAIL -->
      <main class="detail-view-glow fade-in" *ngIf="pageState() === 'detail' && selectedProduct()">
        <div class="breadcrumb-luxe">
          <a (click)="backToShop()">HOME</a> / <a (click)="backToShop()">COLLECTION</a> / <span class="active">{{ selectedProduct()?.product_name | uppercase }}</span>
        </div>
        
        <div class="glow-detail-container">
          <div class="glow-detail-gallery">
            <div class="glow-main-image-wrapper">
              <div class="best-seller-badge" *ngIf="selectedProduct()?.is_best_seller">BEST SELLER</div>
              <img *ngIf="selectedImage()" [src]="selectedImage()" class="glow-main-img" />
              <div class="glow-internal-thumbs" *ngIf="(selectedProduct()?.gallery_photos?.length || 0) > 0">
                <div class="glow-thumb" [class.active]="selectedImage() === selectedProduct()?.photo" (click)="selectedImage.set(selectedProduct()?.photo || null)">
                  <img *ngIf="selectedProduct()?.photo" [src]="selectedProduct()?.photo" />
                </div>
                <div class="glow-thumb" *ngFor="let gImg of selectedProduct()?.gallery_photos" [class.active]="selectedImage() === gImg" (click)="selectedImage.set(gImg)">
                  <img [src]="gImg" />
                </div>
              </div>
            </div>
          </div>
          
          <div class="glow-detail-info">
            <div class="glow-detail-meta">
              <span class="glow-item-code">{{ selectedProduct()?.product_code }}</span>
              <span class="glow-volume" *ngIf="selectedProduct()?.volume">{{ selectedProduct()?.volume }}</span>
            </div>
            <h1 class="glow-detail-title">{{ selectedProduct()?.product_name }}</h1>
            
            <div class="glow-detail-price">
              <span class="amount">\${{ selectedProduct()?.unit_price?.toFixed(2) }}</span>
              <div class="ethical-badges">
                <span class="badge vegan" *ngIf="selectedProduct()?.is_vegan">VEGAN</span>
                <span class="badge cruelty-free" *ngIf="selectedProduct()?.is_cruelty_free">CRUELTY FREE</span>
              </div>
            </div>
            
            <p class="glow-detail-desc">{{ selectedProduct()?.description }}</p>

            <div class="glow-specs-grid">
              <div class="spec-item" *ngIf="selectedProduct()?.skin_type?.length">
                <span class="spec-label">SKIN TYPE</span>
                <span class="spec-value">{{ selectedProduct()?.skin_type?.join(', ') }}</span>
              </div>
              <div class="spec-item" *ngIf="selectedProduct()?.benefits?.length">
                <span class="spec-label">BENEFITS</span>
                <span class="spec-value">{{ selectedProduct()?.benefits?.join(', ') }}</span>
              </div>
            </div>

            <div class="glow-detail-actions">
              <ng-container *ngIf="selectedProduct()!.quantity_in_stock > 0; else soldOutBtn">
                <ng-container *ngIf="user(); else loginToBuy">
                  <button class="glow-add-btn" *ngIf="!getCartItem(selectedProduct()!._id)" (click)="addToCart(selectedProduct()!)">ADD TO BAG</button>
                  <div class="glow-qty-pill" *ngIf="getCartItem(selectedProduct()!._id)">
                    <button class="qty-btn" (click)="changeQty(selectedProduct()!._id, undefined, -1)">-</button>
                    <span class="qty-val">{{ getCartItem(selectedProduct()!._id)!.quantity }} in Bag</span>
                    <button class="qty-btn" (click)="changeQty(selectedProduct()!._id, undefined, 1)">+</button>
                  </div>
                </ng-container>
                <ng-template #loginToBuy>
                  <button class="glow-add-btn" (click)="login()">LOGIN TO PURCHASE</button>
                </ng-template>
              </ng-container>
              <ng-template #soldOutBtn>
                <button class="glow-add-btn" disabled>SOLD OUT</button>
              </ng-template>
            </div>

            <div class="glow-info-accordion">
              <div class="accordion-section" *ngIf="selectedProduct()?.how_to_use">
                <div class="section-trigger">The Ritual</div>
                <div class="section-content">{{ selectedProduct()?.how_to_use }}</div>
              </div>
              <div class="accordion-section" *ngIf="selectedProduct()?.ingredients">
                <div class="section-trigger">Ingredient Glossery</div>
                <div class="section-content">{{ selectedProduct()?.ingredients }}</div>
              </div>
            </div>
          </div>
        </div>
      </main>


      <!-- PAGE: SHOPPING CART (REDESIGNED) -->
      <main class="sc-page fade-in" *ngIf="pageState() === 'cart'">
        <app-cart (proceedCheckout)="proceedToCheckout()" (backShop)="backToShop()"></app-cart>
      </main>

      <!-- PAGE: CHECKOUT -->
      <main class="chk-page fade-in" *ngIf="pageState() === 'checkout'">
        <div class="chk-container">
          
          <div class="chk-left">
            <h1 class="chk-title">Checkout</h1>
            <div class="chk-breadcrumbs">
              <span (click)="pageState.set('cart')">Bag</span> ›
              <span class="active">Information</span> ›
              <span>Payment</span>
            </div>

            <div class="chk-card">
              <h2 class="chk-card-title">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" class="chk-icon"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                Shipping Address
              </h2>
              <div class="chk-form">
                <div class="chk-field full">
                  <label>Full Name</label>
                  <input type="text" [(ngModel)]="shippingName" placeholder="Alexandra Rose" />
                </div>
                <div class="chk-field full">
                  <label>Email</label>
                  <input type="text" [(ngModel)]="shippingEmail" placeholder="[EMAIL_ADDRESS]" />
                </div>
                <div class="chk-field full">
                  <label>Phone</label>
                  <input type="text" [(ngModel)]="shippingPhone" placeholder="123456789" />
                </div>
                <div class="chk-field full">
                  <label>Street Address</label>
                  <input type="text" [(ngModel)]="shippingAddress" placeholder="123 Beauty Lane" />
                </div>
                <div class="chk-row">
                  <div class="chk-field">
                    <label>City</label>
                    <input type="text" [(ngModel)]="shippingCity" placeholder="Los Angeles" />
                  </div>
                  <div class="chk-field">
                    <label>State</label>
                    <input type="text" [(ngModel)]="shippingState" placeholder="CA" />
                  </div>
                  <div class="chk-field">
                    <label>ZIP</label>
                    <input type="text" [(ngModel)]="shippingZip" placeholder="90210" />
                  </div>
                </div>
              </div>
            </div>

            <div class="chk-card">
              <h2 class="chk-card-title">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" class="chk-icon"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                Shipping Method
              </h2>
              <div class="chk-shipping-options">
                <div class="chk-shipping-radio" [class.active]="shippingMethod() === 'standard'" (click)="shippingMethod.set('standard')">
                  <div class="chk-radio-circle"></div>
                  <div class="chk-shipping-info">
                    <strong>Standard Shipping</strong>
                    <p>3-5 business days</p>
                  </div>
                  <strong class="chk-shipping-price">Free</strong>
                </div>
                <div class="chk-shipping-radio" [class.active]="shippingMethod() === 'express'" (click)="shippingMethod.set('express')">
                  <div class="chk-radio-circle"></div>
                  <div class="chk-shipping-info">
                    <strong>Express Delivery</strong>
                    <p>1-2 business days</p>
                  </div>
                  <strong class="chk-shipping-price-text">$12.00</strong>
                </div>
              </div>
            </div>

            <div class="chk-card">
              <h2 class="chk-card-title">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" class="chk-icon"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                Payment Method
              </h2>
              <div class="chk-shipping-options">
                <div class="chk-shipping-radio" [class.active]="paymentMethod() === 'khqr'" (click)="paymentMethod.set('khqr')">
                  <div class="chk-radio-circle"></div>
                  <div class="chk-shipping-info">
                    <strong>Bakong KHQR</strong>
                    <p>Scan and pay instantly with any bank app</p>
                  </div>
                  <div class="chk-shipping-price">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect><rect x="5" y="5" width="6" height="6"></rect><rect x="13" y="5" width="6" height="6"></rect><rect x="5" y="13" width="6" height="6"></rect><rect x="13" y="13" width="6" height="6"></rect></svg>
                  </div>
                </div>
                <div class="chk-shipping-radio" [class.active]="paymentMethod() === 'cash'" (click)="paymentMethod.set('cash')">
                  <div class="chk-radio-circle"></div>
                  <div class="chk-shipping-info">
                    <strong>Cash on Delivery</strong>
                    <p>Pay when you receive your routine</p>
                  </div>
                  <div class="chk-shipping-price">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            <div class="chk-qr-notice" *ngIf="paymentMethod() === 'khqr'">
              <div class="chk-qr-notice-inner">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <p>Your payment will be processed securely via Bakong KHQR. A scan-to-pay QR will be generated once you click Complete Purchase.</p>
              </div>
            </div>

          </div>

          <!-- RIGHT -->
          <div class="chk-right">
            <div class="chk-summary-card">
              <h2 class="chk-summary-title">Order Summary</h2>
              
              <div class="chk-items">
                <div class="chk-item" *ngFor="let item of cart()">
                  <div class="chk-item-img">
                    <img *ngIf="item.product.photo" [src]="item.product.photo" />
                  </div>
                  <div class="chk-item-info">
                    <h4>{{ item.product.product_name }}</h4>
                    <p>Size: {{ item.product.volume || '30ml' }}</p>
                    <span class="chk-item-price">\${{ (item.product.unit_price * item.quantity).toFixed(2) }}</span>
                  </div>
                </div>
              </div>

              <div class="chk-summary-lines">
                <div class="chk-line">
                  <span>Subtotal</span>
                  <strong>\${{ total().toFixed(2) }}</strong>
                </div>
                <div class="chk-line">
                  <span>Shipping</span>
                  <strong [class.free]="shippingMethod() === 'standard'">{{ shippingMethod() === 'standard' ? 'Free' : '$12.00' }}</strong>
                </div>
                <div class="chk-line">
                  <span>Taxes</span>
                  <strong>\$0.00</strong>
                </div>
              </div>

              <div class="chk-total-line">
                <span>Total</span>
                <strong>\${{ (total() + (shippingMethod() === 'express' ? 12 : 0)).toFixed(2) }}</strong>
              </div>

              <button class="chk-submit-btn" (click)="finalizePurchase()">Complete Purchase</button>

              <div class="chk-payment-methods">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="3" height="3"></rect><rect x="14" y="7" width="3" height="3"></rect><rect x="7" y="14" width="3" height="3"></rect><rect x="14" y="14" width="3" height="3"></rect></svg>
              </div>
            </div>

            <div class="chk-trust-badges">
              <div class="chk-badge">
                <svg viewBox="0 0 24 24" fill="none" class="trust-icon" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <span>SECURE</span>
              </div>
              <div class="chk-badge">
                <svg viewBox="0 0 24 24" fill="none" class="trust-icon" stroke="currentColor" stroke-width="2"><path d="M12 2L2 22h20L12 2z"></path></svg>
                <span>VEGAN</span>
              </div>
              <div class="chk-badge">
                <svg viewBox="0 0 24 24" fill="none" class="trust-icon" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                <span>PURE</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- PAGE: SUCCESS -->
      <main class="success-wrap-luxe fade-in" *ngIf="pageState() === 'success'">
        <div class="success-content-luxe">
          <!-- SUCCESS ICON -->
          <div class="success-icon-container">
            <div class="success-icon-glow-ring"></div>
            <div class="success-check-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
          </div>

          <h1 class="success-title-luxe">Thank You for Your Purchase!</h1>
          <p class="success-subtitle-luxe">We've received your order and our team is already getting it ready for shipment.</p>

          <!-- ORDER INFO CARD -->
          <div class="order-summary-card-luxe" *ngIf="lastOrder()">
            <div class="summary-row-luxe">
              <span class="label">Order Number</span>
              <span class="value accent">#ORD-{{ lastOrder()._id?.slice(-8).toUpperCase() || 'GLOW-99284-XPL' }}</span>
            </div>
            <div class="summary-row-luxe">
              <span class="label">Estimated Delivery</span>
              <span class="value">{{ estimatedDelivery() }}</span>
            </div>
            <div class="summary-row-luxe">
              <span class="label">Confirmation Email</span>
              <span class="value">{{ user()?.username || 'hello@user.com' }}</span>
            </div>
          </div>

          <!-- FEATURED BOX IMAGE -->
          <div class="featured-package-glow">
            <img src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1200" alt="Your Package" />
            <div class="img-overlay-luxe"></div>
          </div>

          <!-- ACTIONS -->
          <div class="success-actions-luxe">
            <button class="btn-success-primary" (click)="backToShop()">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
               Back to Shop
            </button>
            <button class="btn-success-outline" (click)="printInvoice()">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
               View Invoice
            </button>
          </div>

          <p class="help-text-luxe">Need help? <a href="#" (click)="$event.preventDefault()">Contact Support</a></p>

          <!-- TRUST FOOTER -->
          <div class="success-trust-footer">
            <div class="trust-icons-luxe">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </div>
            <span class="secured-text-luxe">SECURED BY GLOWPAY</span>
          </div>
        </div>
      </main>

      <!-- PAGE: EXPIRED -->
      <main class="result-page-glow fade-in" *ngIf="pageState() === 'expired'">
        <div class="result-card-glow">
          <div class="result-icon-glow expired">✕</div>
          <h1>Session Expired</h1>
          <p>The secure payment window has closed. No charges were made. Please try checking out again.</p>
          <button class="join-btn" style="padding:1rem 2.5rem; border-radius:12px;" (click)="backToShop()">Back to Shop</button>
        </div>
      </main>

      <!-- PAYMENT OVERLAY -->
      <div class="qr-overlay-glow" *ngIf="pageState() === 'qr'">
        <div class="qr-modal-glow fade-in">
          <h2 style="font-weight:950; font-size:1.5rem;">Scan to Pay</h2>
          <p style="color:var(--glow-text-muted); font-size:0.9rem;">Secure transaction via Bakong KHQR</p>
          
          <div class="qr-placeholder-glow">
            <img *ngIf="qrCodeData()" [src]="qrCodeData()" />
            <div *ngIf="!qrCodeData()" class="pulsing-dot" style="width:40px; height:40px;"></div>
          </div>

          <div class="error-msg-glow" *ngIf="error()">{{ error() }}</div>

          <div class="payment-status-tag status-pending">
            <span class="pulsing-dot"></span>
            WAITING FOR PAYMENT...
          </div>
          <button class="glow-back-link" (click)="pageState.set('checkout')">← Modify Details</button>
        </div>
      </div>
    </div>
  `,
  styleUrl: './store.css'
})
export class StoreComponent implements OnInit, OnDestroy {
  private bakongService = inject(BakongService);
  private authService = inject(AuthService);
  private apiService = inject(ApiService);
  private cartService = inject(CartService);
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  
  user = this.authService.currentUser;
  cart = this.cartService.cart;
  cartCount = this.cartService.cartCount;
  total = this.cartService.total;

  // States
  pageState = signal<PageState>('shop');
  selectedProduct = signal<Product | null>(null);
  selectedImage = signal<string | null>(null);
  selectedSize = signal<string | null>(null);
  products = signal<Product[]>([]);
  loading = signal(false);
  error = signal('');
  categories = signal<any[]>([]);
  currency = signal<'usd' | 'khr'>('usd');
  
  // Payment States
  qrData = signal<GenerateQRResponse | null>(null);
  qrCodeData = signal<string>('');
  pollStatus = signal<'idle' | 'polling' | 'paid' | 'expired'>('idle');
  bestSellers = signal<Product[]>([]);
  activeFilter = signal<string>('all');
  secondsLeft = signal(900);
  
  // Checkout Form States
  paymentMethod = signal<'khqr' | 'cash'>('khqr');
  lastOrder = signal<any>(null);
  shippingName = signal('');
  shippingEmail = signal('');
  shippingPhone = signal('');
  shippingAddress = signal('');
  shippingCity = signal('');
  shippingState = signal('');
  shippingZip = signal('');
  shippingMethod = signal<'standard' | 'express'>('standard');
  promoCode = '';

  private pollInterval: any;
  private countdownInterval: any;

  // Computeds
  totalDisplay = computed(() => {
    const t = this.total();
    return this.currency() === 'usd' ? `$${t.toFixed(2)}` : `${Math.round(t * 4100).toLocaleString()} ៛`;
  });
  
  filteredProducts = computed(() => {
    const p = this.products();
    if (this.activeFilter() === 'best') return this.bestSellers();
    if (this.activeFilter() === 'serums') return p.filter(prod => prod.product_name.toLowerCase().includes('serum'));
    if (this.activeFilter() === 'cleansers') return p.filter(prod => prod.product_name.toLowerCase().includes('cleanser'));
    return p;
  });

  estimatedDelivery = computed(() => {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);

    // Dynamic: 1 to 2 days from today
    start.setDate(now.getDate() + 1);
    end.setDate(now.getDate() + 2);

    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  });

  ngOnInit() { 
    this.loadProducts(); 
    this.loadBestSellers();
    this.apiService.getCategories().subscribe(res => {
      if (res.success) this.categories.set(res.data);
    });

    // Check for fragment (cart)
    this.route.fragment.subscribe(frag => {
      if (frag === 'cart') {
        this.pageState.set('cart');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

    // Check for product ID in URL
    this.route.queryParams.subscribe(params => {
      const productId = params['id'];
      if (productId) {
        // Find product in existing list or wait for load
        if (this.products().length > 0) {
          const found = this.products().find(p => p._id === productId);
          if (found) this.viewProduct(found);
        } else {
          // If products not loaded yet, wait for them
          const sub = this.bakongService.getProducts().subscribe(res => {
            const found = res.data.find((p: any) => p._id === productId);
            if (found) this.viewProduct(found);
            sub.unsubscribe();
          });
        }
      }
    });
  }
  ngOnDestroy() { this.stopPolling(); }

  loadProducts() {
    this.loading.set(true);
    this.bakongService.getProducts().subscribe({
      next: (res) => { this.products.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  loadBestSellers() {
    this.bakongService.getBestSellers().subscribe(res => {
      this.bestSellers.set(res.data);
    });
  }

  login() { this.router.navigate(['/login']); }
  logout() { this.authService.logout(); }

  toggleCart() { 
    this.pageState.set(this.pageState() === 'cart' ? 'shop' : 'cart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  viewProduct(product: Product) {
    this.router.navigate(['/product', product._id]);
  }

  backToShop() {
    this.selectedProduct.set(null);
    this.pageState.set('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  addToCart(product: Product) {
    if (!this.user()) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'Please sign in or create an account to start your glow routine.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Sign In Now',
        cancelButtonText: 'Maybe Later',
        confirmButtonColor: 'var(--primary)',
        background: 'var(--surface)',
        color: 'var(--text)'
      }).then((result) => {
        if (result.isConfirmed) {
          this.login();
        }
      });
      return;
    }

    this.cartService.addToCart(product);
    Swal.fire({
      title: 'Added to Bag',
      text: `1x ${product.product_name} added to your glow routine.`,
      icon: 'success',
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: 2000,
      background: 'var(--surface)',
      color: 'var(--text)'
    });
  }

  getCartItem(id: string) {
    return this.cart().find(i => i.product._id === id);
  }

  changeQty(id: string, size: string | undefined, delta: number) {
    this.cartService.changeQty(id, size, delta);
  }

  removeFromCart(id: string, size: string | undefined) {
    this.cartService.removeFromCart(id, size);
  }

  proceedToCheckout() {
    if (!this.user()) return this.login();
    this.pageState.set('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  finalizePurchase() {
    this.loading.set(true);
    this.error.set('');
    const userId = (this.user() as any)?._id || '000000000000000000000001';
    
    const payload: any = {
      userId: userId,
      items: this.cart().map(i => ({ 
        product_id: i.product._id, 
        quantity: i.quantity, 
        price: i.product.unit_price,
        product: i.product // for invoice display
      })),
      total_amount: this.total() + (this.shippingMethod() === 'express' ? 12 : 0),
      currency: this.currency() as 'usd' | 'khr',
      shipping_address: {
        name: this.shippingName(),
        email: this.shippingEmail(),
        phone: this.shippingPhone(),
        address: this.shippingAddress(),
        city: this.shippingCity(),
        state: this.shippingState(),
        zip: this.shippingZip()
      },
      shipping_method: this.shippingMethod(),
      payment_method: this.paymentMethod(),
      notes: 'Glow Studio Web Order'
    };

    if (this.paymentMethod() === 'cash') {
      this.apiService.createSale(payload).subscribe({
        next: (res) => {
          this.lastOrder.set(res.data);
          this.pageState.set('success');
          this.cartService.clearCart();
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err?.error?.message || 'Failed to process order. Please try again.');
        }
      });
      return;
    }

    this.bakongService.generateQR(payload).subscribe({
      next: (res) => {
        this.qrData.set(res);
        this.lastOrder.set({ ...payload, _id: res.sessionId });
        this.pageState.set('qr');
        this.loading.set(false);

        // Generate QR as base64 PNG — works in browser and SSR
        if (isPlatformBrowser(this.platformId)) {
          QRCode.toDataURL(res.qrString, {
            width: 280,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' },
            errorCorrectionLevel: 'M',
          })
            .then((dataUrl: string) => {
              this.qrCodeData.set(dataUrl);
            })
            .catch((err: any) => {
              console.error('[QR] toDataURL error:', err);
              this.error.set('Failed to render QR image.');
            });
        }
        
        this.startPolling(res.sessionId);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Failed to generate payment QR. Please try again.');
      }
    });
  }

  private startPolling(sessionId: string) {
    this.pollStatus.set('polling');
    this.secondsLeft.set(900);
    
    this.pollInterval = setInterval(() => {
      this.bakongService.checkPayment(sessionId).subscribe(res => {
        if (res.isPaid) {
          this.stopPolling();
          this.pageState.set('success');
          this.cartService.clearCart();
        } else if (res.message?.includes('expired')) {
          this.stopPolling();
          this.pageState.set('expired');
        }
      });
    }, 5000);

    this.countdownInterval = setInterval(() => {
      this.secondsLeft.update(s => s - 1);
      if (this.secondsLeft() <= 0) {
        this.stopPolling();
        this.pageState.set('expired');
      }
    }, 1000);
  }

  private stopPolling() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.countdownInterval) clearInterval(this.countdownInterval);
  }

  get today() { return new Date(); }

  printInvoice() {
    window.print();
  }
}
