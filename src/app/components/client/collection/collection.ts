import { Component, OnInit, signal, computed, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { BakongService, Product } from '../../../services/bakong.service';
import { ApiService } from '../../../services/api.service';
import { NavbarComponent } from '../navbar/navbar';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="store-wrapper">
      <app-navbar></app-navbar>

      <main class="landing-luxe fade-in">
        <!-- HEADER SECTION -->
        <header class="mission-luxe">
           <span class="mission-tag">THE REVELATION</span>
           <h2>{{ selectedCategory() === 'all' ? 'The Collection' : selectedCategory() }} <span>Rituals.</span></h2>
           <p>Explore a curated selection of clean beauty essentials, crafted for performance and purity.</p>
        </header>

        <!-- FILTERS & CATEGORIES -->
        <div class="replica-tabs">
           <button class="tab-link" [class.active]="selectedCategory() === 'all'" (click)="selectedCategory.set('all')">All Products</button>
           <button class="tab-link" 
                   *ngFor="let cat of categories()" 
                   [class.active]="selectedCategory() === cat.category_name"
                   (click)="selectedCategory.set(cat.category_name)">
             {{ cat.category_name }}
           </button>
        </div>

        <!-- SEARCH & SORT CONTROLS -->
        <div class="luxe-controls-bar">
          <div class="luxe-search-wrapper">
            <input type="text" 
                   class="luxe-search-input" 
                   placeholder="SEARCH COLLECTION..." 
                   [ngModel]="searchTerm()"
                   (ngModelChange)="searchTerm.set($event)" />
          </div>

          <div class="luxe-filter-group">
            <span class="luxe-filter-count">{{ filteredProducts().length }} RITUALS</span>
            <button class="luxe-sort-trigger" (click)="toggleSortPrice()">
              PRICE {{ sortPrice() === 'asc' ? '(LOW-HIGH)' : sortPrice() === 'desc' ? '(HIGH-LOW)' : '' }}
              <span class="arrow">{{ sortPrice() === 'asc' ? '↑' : sortPrice() === 'desc' ? '↓' : '↕' }}</span>
            </button>
          </div>
        </div>

        <!-- PRODUCTS GRID -->
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
                    <div class="luxe-badge" *ngIf="i % 5 === 0">Trending</div>
                    <div class="luxe-badge exclusive" *ngIf="i % 7 === 0">Exclusive</div>
                    <div class="luxe-wishlist">❤</div>
                    <img *ngIf="p.photo" [src]="p.photo" [alt]="p.product_name" />
                    <span *ngIf="!p.photo" style="font-size:3rem; opacity:0.1; font-weight:900">GLOW</span>
                 </div>
                 <div class="luxe-card-info">
                    <h3>{{ p.product_name }}</h3>
                    <div class="price">\${{ p.unit_price.toFixed(2) }}</div>
                    <span class="category">{{ p.description || 'Clean Beauty Ritual' }}</span>
                 </div>
              </div>
           </div>
        </section>
      </main>
    </div>
  `,
  styleUrl: '../store/store.css'
})
export class CollectionComponent implements OnInit {
  private bakong = inject(BakongService);
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = signal(true);
  products = signal<Product[]>([]);
  categories = signal<any[]>([]);
  selectedCategory = signal<string>('all');
  searchTerm = signal('');
  activeTab = signal<string>('new');
  sortPrice = signal<'none' | 'asc' | 'desc'>('none');

  filteredProducts = computed(() => {
    let list = [...this.products()];
    const cat = this.selectedCategory();
    const sort = this.sortPrice();
    const search = this.searchTerm().toLowerCase();

    if (cat !== 'all') {
      list = list.filter(p => p.category?.category_name === cat);
    }

    if (search) {
      list = list.filter(p => 
        p.product_name.toLowerCase().includes(search) || 
        p.description?.toLowerCase().includes(search)
      );
    }

    if (sort === 'asc') {
      list.sort((a, b) => a.unit_price - b.unit_price);
    } else if (sort === 'desc') {
      list.sort((a, b) => b.unit_price - a.unit_price);
    }

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
    this.api.getCategories().subscribe(res => {
      if (res.success) this.categories.set(res.data);
    });

    this.route.queryParams.subscribe(params => {
       if (params['category']) this.selectedCategory.set(params['category']);
       if (params['q']) this.searchTerm.set(params['q']);
    });
  }

  toggleSortPrice() {
    const cur = this.sortPrice();
    if (cur === 'none') this.sortPrice.set('asc');
    else if (cur === 'asc') this.sortPrice.set('desc');
    else this.sortPrice.set('none');
  }

  viewProduct(p: Product) {
    this.router.navigate(['/product', p._id]);
  }
}
