import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Products Inventory</h1>
        <p class="page-subtitle">Manage all your store products and stock</p>
      </div>
      <button class="btn btn-primary" (click)="openModal()">
        <span class="icon">+</span> Add New Product
      </button>
    </div>

    <!-- Error/Loading -->
    <div *ngIf="loading()" class="status-box">Loading products...</div>
    <div *ngIf="error()" class="status-box error">{{ error() }}</div>

    <div class="table-container">
      <table class="premium-table">
        <thead>
          <tr>
            <th>Photo</th>
            <th>Code</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Reorder Lvl</th>
            <th class="actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of products()">
            <td>
              <div class="prod-thumb">
                <img *ngIf="p.photo" [src]="p.photo" alt="Photo" />
                <span *ngIf="!p.photo" class="placeholder-icon">📦</span>
              </div>
            </td>
            <td><span class="product-code">{{ p.product_code }}</span></td>
            <td><strong>{{ p.product_name }}</strong></td>
            <td>{{ p.category?.category_name || '-' }}</td>
            <td class="price">\${{ p.unit_price?.toFixed(2) }}</td>
            <td>
              <span class="badge" [ngClass]="p.quantity_in_stock <= p.reorder_level ? 'badge-danger' : 'badge-success'">
                {{ p.quantity_in_stock }}
              </span>
            </td>
            <td>{{ p.reorder_level }}</td>
            <td class="actions-col">
              <button class="action-btn edit-btn" (click)="openModal(p)">✏️</button>
              <button class="action-btn del-btn" (click)="deleteProduct(p._id)">🗑️</button>
            </td>
          </tr>
          <tr *ngIf="products().length === 0 && !loading()">
            <td colspan="8" class="empty-state">No products found. Start by adding a new one.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <div class="modal-overlay" *ngIf="showModal()">
      <div class="modal-content">
        <h2>{{ editingProduct() ? 'Edit Product' : 'Add New Product' }}</h2>
        <form (ngSubmit)="saveProduct()">
          <div class="form-row">
            <div class="form-group flex-1">
              <label>Product Name</label>
              <input class="form-control" type="text" [(ngModel)]="formData.product_name" name="name" required />
            </div>
            <div class="form-group flex-1">
              <label>Code</label>
              <input class="form-control" type="text" [(ngModel)]="formData.product_code" name="code" required />
            </div>
          </div>
          
          <div class="form-group">
            <label>Price ($)</label>
            <input class="form-control" type="number" [(ngModel)]="formData.unit_price" name="price" required />
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label>Quantity in Stock</label>
              <input class="form-control" type="number" [(ngModel)]="formData.quantity_in_stock" name="stock" />
            </div>
            <div class="form-group flex-1">
              <label>Reorder Level</label>
              <input class="form-control" type="number" [(ngModel)]="formData.reorder_level" name="reorder" />
            </div>
          </div>

          <div class="form-group">
            <label>Master Photo URL</label>
            <input class="form-control" type="url" [(ngModel)]="formData.photo" name="photo" placeholder="https://example.com/main-image.jpg" />
          </div>

          <div class="form-group">
            <label>Gallery Photos (Comma separated URLs)</label>
            <textarea class="form-control" rows="2" [(ngModel)]="formData.gallery_string" name="gallery_photos" placeholder="url1.jpg, url2.jpg, url3.jpg"></textarea>
          </div>

          <div class="form-group">
            <label>Available Sizes (Comma separated)</label>
            <input class="form-control" type="text" [(ngModel)]="formData.sizes_string" name="sizes" placeholder="XS, S, M, L, XL" />
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-outline" (click)="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Product</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2rem;
    }
    .status-box {
      padding: 1rem; margin-bottom: 1rem; border-radius: 8px;
      background: var(--surface2); color: var(--muted);
    }
    .status-box.error { background: rgba(239, 68, 68, 0.1); color: var(--red); }
    .product-code {
      font-family: monospace; color: var(--accent);
      background: rgba(79, 142, 247, 0.1); padding: 0.2rem 0.5rem; border-radius: 4px;
    }
    .price { font-weight: 700; color: #fff; }
    .actions-col { text-align: right; }
    .action-btn {
      background: none; border: none; cursor: pointer;
      font-size: 1.1rem; padding: 0.25rem; opacity: 0.7; transition: 0.2s;
    }
    .action-btn:hover { opacity: 1; transform: scale(1.1); }
    .del-btn:hover { color: var(--red); }
    .empty-state { text-align: center; padding: 3rem !important; color: var(--muted); }
    
    .form-row { display: flex; gap: 1rem; }
    .flex-1 { flex: 1; }
    .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text); }
    .btn-outline:hover { background: var(--surface2); }
    .prod-thumb {
      width: 40px; height: 40px; border-radius: 8px; background: var(--surface2);
      display: flex; align-items: center; justify-content: center; overflow: hidden;
      border: 1px solid var(--border);
    }
    .prod-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .placeholder-icon { opacity: 0.5; font-size: 1.2rem; }
  `]
})
export class Products implements OnInit {
  products = signal<any[]>([]);
  loading = signal(false);
  error = signal('');
  
  showModal = signal(false);
  editingProduct = signal<any>(null);
  formData: any = {};

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true);
    // Based on backend response logic, might be under res.data or direct array
    this.apiService.getProducts().subscribe({
      next: (res: any) => {
        this.products.set(res.data || res || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load products');
        this.loading.set(false);
      }
    });
  }

  openModal(product?: any) {
    if (product) {
      this.editingProduct.set(product);
      this.formData = { 
        ...product,
        gallery_string: product.gallery_photos?.join(', ') || '',
        sizes_string: product.sizes?.join(', ') || ''
      };
    } else {
      this.editingProduct.set(null);
      this.formData = { quantity_in_stock: 0, reorder_level: 10, gallery_string: '', sizes_string: '' };
    }
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.formData = {};
  }

  saveProduct() {
    const payload = {
      ...this.formData,
      gallery_photos: this.formData.gallery_string 
        ? this.formData.gallery_string.split(',').map((s: string) => s.trim()).filter(Boolean) 
        : [],
      sizes: this.formData.sizes_string 
        ? this.formData.sizes_string.split(',').map((s: string) => s.trim().toUpperCase()).filter(Boolean) 
        : []
    };

    const ob = this.editingProduct() 
      ? this.apiService.updateProduct(this.editingProduct()._id, payload)
      : this.apiService.createProduct(payload);

    ob.subscribe({
      next: () => {
        this.closeModal();
        this.loadProducts();
      },
      error: (err) => alert('Failed to save product: ' + (err.error?.message || err.message))
    });
  }

  deleteProduct(id: string) {
    if(confirm('Are you sure you want to delete this product?')) {
      this.apiService.deleteProduct(id).subscribe({
        next: () => this.loadProducts(),
        error: (err) => alert('Failed to delete')
      });
    }
  }
}
