import { Component, OnInit, signal, computed, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BakongService, Product } from '../../../services/bakong.service';
import { NavbarComponent } from '../navbar/navbar';

@Component({
  selector: 'app-makeup',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FormsModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="store-wrapper">
      <app-navbar></app-navbar>

      <main class="landing-luxe fade-in">
        <header class="mission-luxe">
          <span class="mission-tag">THE PALETTE</span>
          <h2>Artistry <span>Makeup.</span></h2>
          <p>Elevate your expression with our high-pigment, skin-first makeup collection.</p>
        </header>

        <!-- FILTERS & CATEGORIES -->
        <div class="replica-tabs">
           <button class="tab-link" [class.active]="selectedSubCategory() === 'all'" (click)="selectedSubCategory.set('all')">All Options</button>
           <button class="tab-link" 
                   *ngFor="let sub of subCategories()" 
                   [class.active]="selectedSubCategory() === sub"
                   (click)="selectedSubCategory.set(sub)">
             {{ sub }}
           </button>
        </div>

        <div class="luxe-controls-bar">
          <div class="luxe-search-wrapper">
            <input type="text" 
                   class="luxe-search-input" 
                   placeholder="SEARCH MAKEUP..." 
                   [ngModel]="searchTerm()"
                   (ngModelChange)="searchTerm.set($event)" />
          </div>

          <div class="luxe-filter-group">
            <span class="luxe-filter-count">{{ filteredProducts().length }} RITUALS</span>
            <button class="luxe-sort-trigger" (click)="toggleSort()">
              PRICE {{ sortOrder() === 'asc' ? '↑' : sortOrder() === 'desc' ? '↓' : '↕' }}
            </button>
          </div>
        </div>

        <section class="section-luxe">
          <!-- SKELETON WIREFRAME -->
          <div class="luxe-grid" *ngIf="loading()">
            <div class="luxe-card" *ngFor="let s of [1,2,3,4,5,6,7,8]">
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
            <div class="luxe-card" *ngFor="let p of filteredProducts(); let i = index" (click)="viewProduct(p)">
              <div class="luxe-img-box">
                <div class="luxe-badge exclusive" *ngIf="i % 3 === 0">MUA Choice</div>
                <div class="luxe-wishlist">❤</div>
                <img *ngIf="p.photo" [src]="p.photo" [alt]="p.product_name" />
                <span *ngIf="!p.photo" style="font-size:3rem; opacity:0.1; font-weight:900">GLOW</span>
              </div>
              <div class="luxe-card-info">
                <h3>{{ p.product_name }}</h3>
                <div class="price">\${{ p.unit_price.toFixed(2) }}</div>
                <span class="category">{{ p.sub_category || 'Artistry Essential' }}</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  `,
  styleUrl: '../store/store.css'
})
export class MakeupComponent implements OnInit {
  private bakong = inject(BakongService);
  private router = inject(Router);

  loading = signal(true);
  products = signal<Product[]>([]);
  searchTerm = signal('');
  sortOrder = signal<'asc' | 'desc' | 'none'>('none');
  selectedSubCategory = signal<string>('all');

  // Compute unique sub-categories
  subCategories = computed(() => {
    const list = this.products().filter(p => p.category?.category_name.toLowerCase().includes('makeup') || p.category?.category_name.toLowerCase().includes('face'));
    const subs = Array.from(new Set(list.map(p => p.sub_category).filter(Boolean))) as string[];
    return subs.sort();
  });

  filteredProducts = computed(() => {
    let list = this.products().filter(p => p.category?.category_name.toLowerCase().includes('makeup') || p.category?.category_name.toLowerCase().includes('face'));
    
    const sub = this.selectedSubCategory();
    if (sub !== 'all') {
      list = list.filter(p => p.sub_category === sub);
    }

    const search = this.searchTerm().toLowerCase();
    if (search) list = list.filter(p => p.product_name.toLowerCase().includes(search) || p.description?.toLowerCase().includes(search));
    
    if (this.sortOrder() === 'asc') list.sort((a, b) => a.unit_price - b.unit_price);
    else if (this.sortOrder() === 'desc') list.sort((a, b) => b.unit_price - a.unit_price);
    return list;
  });

  ngOnInit() {
    this.bakong.getProducts().subscribe({
      next: (res) => {
        if (res.success) this.products.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  toggleSort() {
    if (this.sortOrder() === 'none') this.sortOrder.set('asc');
    else if (this.sortOrder() === 'asc') this.sortOrder.set('desc');
    else this.sortOrder.set('none');
  }

  viewProduct(p: Product) { this.router.navigate(['/product', p._id]); }
}
