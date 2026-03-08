import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { BakongService, Product } from '../../../services/bakong.service';
import { CartService } from '../../../services/cart.service';
import { AuthService } from '../../../services/auth.service';
import { NavbarComponent } from '../navbar/navbar';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  styles: [`
    /* ---- PRODUCT DETAIL PAGE ---- */
    .pd-page {
      background: #fff;
      min-height: 100vh;
      font-family: 'Jost', sans-serif;
    }

    /* === HERO SPLIT === */
    .pd-hero {
      display: grid;
      grid-template-columns: 1fr 1fr;
      max-width: 1100px;
      margin: 0 auto;
      padding: 3rem 2rem 0;
      gap: 4rem;
      align-items: start;
    }

    /* LEFT: image column */
    .pd-gallery {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .pd-main-img {
      width: 100%;
      aspect-ratio: 4/5;
      background: #f9e8e8;
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .pd-main-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s ease;
    }

    .pd-main-img img:hover { transform: scale(1.03); }

    .pd-thumbs {
      display: flex;
      gap: 0.75rem;
    }

    .pd-thumb {
      flex: 1;
      aspect-ratio: 1/1;
      border-radius: 10px;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      transition: border-color 0.2s;
      background: #f4f4f4;
    }

    .pd-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .pd-thumb:hover { border-color: #ff3366; }
    .pd-thumb.active { border-color: #ff3366; }

    /* RIGHT: info column */
    .pd-info {
      padding-top: 0.5rem;
    }

    .pd-badge {
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 2px;
      color: #ff3366;
      text-transform: uppercase;
      margin-bottom: 0.75rem;
      display: block;
    }

    .pd-title {
      font-size: 2.6rem;
      font-weight: 800;
      line-height: 1.15;
      color: #111;
      margin: 0 0 0.5rem;
      font-family: 'Jost', sans-serif;
    }

    .pd-subtitle {
      font-size: 0.95rem;
      font-style: italic;
      color: #ff3366;
      margin-bottom: 1.25rem;
      display: block;
    }

    .pd-rating {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .pd-stars {
      color: #ff3366;
      font-size: 1rem;
      letter-spacing: 1px;
    }

    .pd-review-count {
      font-size: 0.8rem;
      color: #888;
      font-weight: 500;
    }

    .pd-price {
      font-size: 2rem;
      font-weight: 600;
      color: #111;
      margin-bottom: 1.25rem;
    }

    .pd-desc {
      font-size: 0.9rem;
      color: #555;
      line-height: 1.7;
      margin-bottom: 2rem;
    }

    /* QUANTITY label */
    .pd-qty-label {
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 2px;
      color: #888;
      text-transform: uppercase;
      margin-bottom: 0.75rem;
      display: block;
    }

    /* QUANTITY + CTA row */
    .pd-action-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2.5rem;
    }

    .pd-qty {
      display: flex;
      align-items: center;
      border: 1.5px solid #e0e0e0;
      border-radius: 10px;
      height: 52px;
      overflow: hidden;
      background: #fff;
      flex-shrink: 0;
    }

    .pd-qty button {
      background: none;
      border: none;
      width: 44px;
      height: 52px;
      font-size: 1.3rem;
      cursor: pointer;
      color: #444;
      transition: background 0.2s;
    }

    .pd-qty button:hover { background: #fdf0f3; }

    .pd-qty span {
      width: 36px;
      text-align: center;
      font-weight: 700;
      font-size: 1rem;
      color: #111;
      border-left: 1.5px solid #e0e0e0;
      border-right: 1.5px solid #e0e0e0;
      line-height: 52px;
      display: block;
    }

    .pd-add-btn {
      flex: 1;
      height: 52px;
      background: #ff3366;
      color: #fff;
      border: none;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.95rem;
      letter-spacing: 0.5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      transition: background 0.25s, transform 0.2s;
    }

    .pd-add-btn:hover {
      background: #e62e5c;
      transform: translateY(-2px);
    }

    .pd-add-btn svg { width: 18px; flex-shrink: 0; }

    /* === ACCORDION === */
    .pd-accordion { border-top: 1px solid #eee; }

    .pd-acc-item { border-bottom: 1px solid #eee; }

    .pd-acc-trigger {
      padding: 1.1rem 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      font-weight: 700;
      font-size: 0.9rem;
      color: #222;
      user-select: none;
    }

    .pd-acc-icon { font-size: 0.8rem; color: #888; transition: transform 0.3s; }
    .pd-acc-item.open .pd-acc-icon { transform: rotate(180deg); }

    .pd-acc-body {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .pd-acc-item.open .pd-acc-body { max-height: 500px; }

    .pd-acc-body p {
      font-size: 0.85rem;
      color: #555;
      line-height: 1.65;
      padding-bottom: 0.6rem;
      margin: 0;
    }

    .pd-acc-body p:last-child { padding-bottom: 1.5rem; }

    /* === REVIEWS === */
    .pd-reviews {
      max-width: 1100px;
      margin: 5rem auto 0;
      padding: 0 2rem;
      border-top: 1px solid #eee;
    }

    .pd-reviews h3 {
      text-align: center;
      font-size: 1.6rem;
      font-weight: 700;
      margin: 3.5rem 0 3rem;
      color: #111;
    }

    .pd-reviews-grid {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: 5rem;
      align-items: center;
      max-width: 800px;
      margin: 0 auto 5rem;
    }

    .pd-score-col {
      text-align: center;
    }

    .pd-big-score {
      font-size: 5.5rem;
      font-weight: 700;
      line-height: 1;
      color: #111;
      display: block;
    }

    .pd-stars-row {
      color: #ff3366;
      font-size: 1.1rem;
      letter-spacing: 3px;
      margin: 0.5rem 0;
    }

    .pd-score-col p {
      font-size: 0.8rem;
      color: #888;
      margin: 0;
    }

    .pd-bars { display: flex; flex-direction: column; gap: 0.6rem; }

    .pd-bar-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.82rem;
      color: #555;
    }

    .pd-bar-row > span:first-child { width: 8px; text-align: right; font-weight: 700; color: #333; }
    .pd-bar-track { flex: 1; height: 7px; background: #f0e8e8; border-radius: 10px; overflow: hidden; }
    .pd-bar-fill { height: 100%; background: #ff3366; border-radius: 10px; transition: width 1s ease; }
    .pd-bar-row > span:last-child { width: 34px; font-weight: 700; color: #ff3366; font-size: 0.78rem; }

    /* === FOOTER === */
    .pd-footer {
      background: #fdf6f8;
      padding: 5rem 2rem 2.5rem;
      margin-top: 6rem;
    }

    .pd-footer-grid {
      max-width: 1100px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 3rem;
    }

    .pd-footer-brand {
      font-size: 1.3rem;
      font-weight: 800;
      color: #111;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .pd-footer-brand-dot { color: #ff3366; }

    .pd-footer p {
      font-size: 0.85rem;
      color: #888;
      line-height: 1.7;
      max-width: 260px;
    }

    .pd-footer h4 {
      font-size: 0.8rem;
      font-weight: 800;
      letter-spacing: 1px;
      margin-bottom: 1.25rem;
      color: #333;
    }

    .pd-footer a {
      display: block;
      font-size: 0.875rem;
      color: #666;
      text-decoration: none;
      margin-bottom: 0.75rem;
      transition: color 0.2s;
    }

    .pd-footer a:hover { color: #ff3366; }

    .pd-footer-bottom {
      max-width: 1100px;
      margin: 3rem auto 0;
      border-top: 1px solid #eee;
      padding-top: 1.5rem;
      text-align: center;
      font-size: 0.78rem;
      color: #bbb;
    }

    /* responsive */
    @media (max-width: 900px) {
      .pd-hero { grid-template-columns: 1fr; gap: 2rem; }
      .pd-reviews-grid { grid-template-columns: 1fr; gap: 3rem; }
      .pd-footer-grid { grid-template-columns: 1fr 1fr; }
      .pd-title { font-size: 2rem; }
    }
  `],
  template: `
    <div class="pd-page store-wrapper fade-in mt-3" >
      <app-navbar />

      <main *ngIf="product()" class="mt-3">

        <!-- HERO SPLIT -->
        <div class="pd-hero">

          <!-- LEFT: IMAGE + THUMBS -->
          <div class="pd-gallery">
            <div class="pd-main-img">
              <img [src]="selectedImage() || product()?.photo" [alt]="product()?.product_name" />
            </div>
            <div class="pd-thumbs">
              <div class="pd-thumb" [class.active]="selectedImage() === product()?.photo"
                   (click)="selectedImage.set(product()!.photo ?? null)">
                <img [src]="product()?.photo" />
              </div>
              <div class="pd-thumb" (click)="selectedImage.set('/assets/detail_2.png')">
                <img src="/assets/detail_2.png" />
              </div>
              <div class="pd-thumb" (click)="selectedImage.set('/assets/detail_3.png')">
                <img src="/assets/detail_3.png" />
              </div>
              <div class="pd-thumb" (click)="selectedImage.set('/assets/detail_4.png')">
                <img src="/assets/detail_4.png" />
              </div>
            </div>
          </div>

          <!-- RIGHT: INFO -->
          <div class="pd-info">
            <span class="pd-badge">BEST SELLER</span>
            <h1 class="pd-title">{{ product()?.product_name }}</h1>
            <span class="pd-subtitle">{{ product()?.description || 'Rejuvenating & Brightening Formula' }}</span>

            <div class="pd-rating">
              <span class="pd-stars">★★★★★</span>
              <span class="pd-review-count">124 Verified Reviews</span>
            </div>

            <div class="pd-price">\${{ product()?.unit_price?.toFixed(2) }}</div>

            <p class="pd-desc">
              Unlock your skin's inner light with our {{ product()?.product_name }}.
              Infused with stabilized Vitamin C and botanical extracts, this lightweight formula
              targets dullness, uneven texture, and fine lines for a visibly brighter,
              smoother complexion.
            </p>

            <!-- QUANTITY + ADD TO CART -->
            <span class="pd-qty-label">QUANTITY</span>
            <div class="pd-action-row">
              <div class="pd-qty">
                <button (click)="updateQty(-1)">−</button>
                <span>{{ quantity() }}</span>
                <button (click)="updateQty(1)">+</button>
              </div>
              <button class="pd-add-btn" (click)="bagIt()">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4ZM3 6h18M16 10a4 4 0 0 1-8 0"/>
                </svg>
                Add to Cart
              </button>
            </div>

            <!-- ACCORDION -->
            <div class="pd-accordion">

              <div class="pd-acc-item" [class.open]="activeTab() === 'ingredients'">
                <div class="pd-acc-trigger" (click)="toggleTab('ingredients')">
                  <span>🌿 Key Ingredients</span>
                  <span class="pd-acc-icon">▼</span>
                </div>
                <div class="pd-acc-body">
                  <p><strong>15% Vitamin C:</strong> Potent antioxidant that brightens skin tone and boosts collagen production.</p>
                  <p><strong>Hyaluronic Acid:</strong> Deeply hydrates and plumps skin for a dewy finish.</p>
                  <p><strong>Niacinamide:</strong> Minimizes pore appearance and strengthens the moisture barrier.</p>
                  <p><strong>Rosehip Oil:</strong> Rich in essential fatty acids to nourish and repair skin.</p>
                </div>
              </div>

              <div class="pd-acc-item" [class.open]="activeTab() === 'usage'">
                <div class="pd-acc-trigger" (click)="toggleTab('usage')">
                  <span>☀️ How to Use</span>
                  <span class="pd-acc-icon">▼</span>
                </div>
                <div class="pd-acc-body">
                  <p>Apply 2–3 drops to clean, dry skin every morning and evening. Follow with moisturizer and SPF 30+ in the morning.</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- REVIEWS -->
        <section class="pd-reviews">
          <h3>Customer Experiences</h3>
          <div class="pd-reviews-grid">
            <div class="pd-score-col">
              <span class="pd-big-score">4.8</span>
              <div class="pd-stars-row">★★★★★</div>
              <p>Based on 124 reviews</p>
            </div>
            <div class="pd-bars">
              <div class="pd-bar-row">
                <span>5</span>
                <div class="pd-bar-track"><div class="pd-bar-fill" style="width:80%"></div></div>
                <span>80%</span>
              </div>
              <div class="pd-bar-row">
                <span>4</span>
                <div class="pd-bar-track"><div class="pd-bar-fill" style="width:12%"></div></div>
                <span>12%</span>
              </div>
              <div class="pd-bar-row">
                <span>3</span>
                <div class="pd-bar-track"><div class="pd-bar-fill" style="width:5%"></div></div>
                <span>5%</span>
              </div>
              <div class="pd-bar-row">
                <span>2</span>
                <div class="pd-bar-track"><div class="pd-bar-fill" style="width:1%"></div></div>
                <span>1%</span>
              </div>
              <div class="pd-bar-row">
                <span>1</span>
                <div class="pd-bar-track"><div class="pd-bar-fill" style="width:2%"></div></div>
                <span>2%</span>
              </div>
            </div>
          </div>
        </section>

        <!-- FOOTER -->
        <footer class="pd-footer">
          <div class="pd-footer-grid">
            <div>
              <div class="pd-footer-brand">
                <span class="pd-footer-brand-dot">✿</span> Glow Studio
              </div>
              <p>Modern skincare rituals for an effortless, radiant glow. Ethical, sustainable, and proven results.</p>
            </div>
            <div>
              <h4>SHOP</h4>
              <a routerLink="/collection">All Products</a>
              <a routerLink="/collection">Best Sellers</a>
              <a>Gift Cards</a>
            </div>
            <div>
              <h4>HELP</h4>
              <a>Shipping Info</a>
              <a>Returns</a>
              <a>FAQ</a>
            </div>
            <div>
              <h4>STAY CONNECTED</h4>
              <a>Instagram</a>
              <a>TikTok</a>
              <a>Pinterest</a>
            </div>
          </div>
          <div class="pd-footer-bottom">© 2024 Glow Studio Co. All rights reserved.</div>
        </footer>

      </main>
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private bakongService = inject(BakongService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private router = inject(Router);

  product = signal<Product | null>(null);
  selectedImage = signal<string | null>(null);
  quantity = signal(1);
  activeTab = signal<string | null>('ingredients');

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.bakongService.getProducts().subscribe((res: any) => {
          const p = res.data?.find((item: Product) => item._id === id);
          if (p) {
            this.product.set(p);
            this.selectedImage.set(p.photo ?? null);
          } else {
            // Fallback: try best sellers
            this.bakongService.getBestSellers().subscribe((res2: { data: Product[] }) => {
              const p2 = res2.data.find((item: Product) => item._id === id);
              if (p2) {
                this.product.set(p2);
                this.selectedImage.set(p2.photo ?? null);
              }
            });
          }
        });
      }
    });
  }

  updateQty(delta: number) {
    this.quantity.update(q => Math.max(1, q + delta));
  }

  toggleTab(tab: string) {
    this.activeTab.update(cur => cur === tab ? null : tab);
  }

  bagIt() {
    if (!this.authService.isAuthenticated()) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'Please sign in to add items to your glow routine.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Sign In',
        cancelButtonText: 'Later',
        confirmButtonColor: 'var(--primary)',
        background: 'var(--surface)',
        color: 'var(--text)'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
      return;
    }

    if (this.product()) {
      for (let i = 0; i < this.quantity(); i++) {
        this.cartService.addToCart(this.product()!);
      }
      
      Swal.fire({
        title: 'Added to Bag',
        text: `${this.quantity()}x ${this.product()?.product_name} added to your glow routine.`,
        icon: 'success',
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        background: 'var(--surface)',
        color: 'var(--text)'
      });
    }
  }
}
