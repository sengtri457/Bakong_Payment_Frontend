import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title text-black">Products Inventory</h1>
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
            <td>
              {{ p.category?.category_name || '-' }}
              <span *ngIf="p.sub_category" style="font-size: 0.75rem; background: var(--surface2); padding: 2px 6px; border-radius: 4px; margin-left: 6px; color: var(--muted);">{{ p.sub_category }}</span>
            </td>
            <td >\${{ p.unit_price?.toFixed(2) }}</td>
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
    <div class="modal-overlay" *ngIf="showModal()" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <button class="modal-close" (click)="closeModal()">✕</button>
        <h2>{{ editingProduct() ? 'Edit Product' : 'Add New Product' }}</h2>
        
        <form (ngSubmit)="saveProduct()">
          <div class="form-section">
            <div class="form-row">
              <div class="form-group flex-2">
                <label>Product Name</label>
                <input class="form-control" type="text" [(ngModel)]="formData.product_name" name="name" required placeholder="e.g. Signature Essence" />
              </div>
              <div class="form-group flex-1">
                <label>Code</label>
                <input class="form-control" type="text" [(ngModel)]="formData.product_code" name="code" required placeholder="PRD-001" />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group flex-1">
                <label>Category</label>
                <select class="form-control" [(ngModel)]="formData.category_target" name="category" required>
                   <option value="" disabled>Select Category</option>
                   <option *ngFor="let cat of categories()" [value]="cat._id + '|' + cat.category_name">
                     {{ cat.category_name }}
                   </option>
                </select>
              </div>
              <div class="form-group flex-1">
                 <label>Sub Category</label>
                 <select class="form-control" [(ngModel)]="formData.sub_category" name="sub_category">
                   <option value="" disabled>Select Sub-category</option>
                   <option *ngIf="getAvailableSubCategories().length === 0" value="">No sub-categories</option>
                   <option *ngFor="let sub of getAvailableSubCategories()" [value]="sub">{{ sub }}</option>
                 </select>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-title">Pricing & Inventory</h3>
            <div class="form-row">
              <div class="form-group flex-1">
                <label>Price ($)</label>
                <input class="form-control" type="number" [(ngModel)]="formData.unit_price" name="price" required placeholder="0.00" />
              </div>
              <div class="form-group flex-1">
                <label>Available Sizes</label>
                <input class="form-control" type="text" [(ngModel)]="formData.sizes_string" name="sizes" placeholder="XS, S, M, L, XL" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label>Stock Quantity</label>
                <input class="form-control" type="number" [(ngModel)]="formData.quantity_in_stock" name="stock" />
              </div>
              <div class="form-group flex-1">
                <label>Reorder Level</label>
                <input class="form-control" type="number" [(ngModel)]="formData.reorder_level" name="reorder" />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-title">Media & Details</h3>
            <div class="form-group">
              <label>Master Photo URL</label>
              <input class="form-control" type="url" [(ngModel)]="formData.photo" name="photo" placeholder="https://example.com/main-image.jpg" />
            </div>

            <div class="form-group">
              <label>Gallery Photos (Comma separated)</label>
              <textarea class="form-control" rows="2" [(ngModel)]="formData.gallery_string" name="gallery_photos" placeholder="url1.jpg, url2.jpg, url3.jpg"></textarea>
            </div>

            <div class="form-group">
               <label>Description / Tagline</label>
               <input class="form-control" type="text" [(ngModel)]="formData.description" name="description" placeholder="A brief, elegant description of the product..." />
            </div>
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
    
    .form-row { display: flex; gap: 1.5rem; }
    .flex-1 { flex: 1; }
    .flex-2 { flex: 2; }
    .form-section { margin-bottom: 2.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid #f1f5f9; }
    .form-section:last-of-type { border-bottom: none; margin-bottom: 0; }
    .section-title { 
      font-size: 0.7rem; font-weight: 800; text-transform: uppercase; 
      letter-spacing: 2px; color: var(--luxe-primary); margin-bottom: 1.5rem;
      opacity: 0.9;
    }
    .modal-close {
      position: absolute; top: 1.5rem; right: 1.5rem;
      background: #f1f5f9; border: none; width: 32px; height: 32px;
      border-radius: 50%; cursor: pointer; display: flex; align-items: center;
      justify-content: center; font-size: 0.8rem; color: var(--luxe-muted);
      transition: all 0.2s;
    }
    .modal-close:hover { background: #fee2e2; color: #ef4444; transform: rotate(90deg); }
    .btn-outline { 
      background: white; border: 1.5px solid #e2e8f0; color: #64748b; 
    }
    .btn-outline:hover { background: #f8fafc; border-color: #cbd5e1; }
    .prod-thumb {
      width: 44px; height: 44px; border-radius: 10px; background: var(--luxe-bg);
      display: flex; align-items: center; justify-content: center; overflow: hidden;
      border: 1px solid var(--luxe-border);
    }
    .prod-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .placeholder-icon { opacity: 0.5; font-size: 1.2rem; }
  `]
})
export class Products implements OnInit {
  products = signal<any[]>([]);
  categories = signal<any[]>([]);
  loading = signal(false);
  error = signal('');
  
  showModal = signal(false);
  editingProduct = signal<any>(null);
  formData: any = {};

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
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

  loadCategories() {
    this.apiService.getCategories().subscribe({
      next: (res: any) => {
        this.categories.set(res.data || res || []);
      },
      error: () => {
        console.error('Failed to load categories');
      }
    });
  }

  getAvailableSubCategories(): string[] {
    if (!this.formData.category_target) return [];
    const id = this.formData.category_target.split('|')[0];
    const cat = this.categories().find(c => c._id === id);
    return cat && cat.sub_categories ? cat.sub_categories : [];
  }

  openModal(product?: any) {
    if (product) {
      this.editingProduct.set(product);
      this.formData = { 
        ...product,
        // pre-fill the dropdown value
        category_target: product.category?.category_id && product.category?.category_name ? `${product.category.category_id}|${product.category.category_name}` : '',
        gallery_string: product.gallery_photos?.join(', ') || '',
        sizes_string: product.sizes?.join(', ') || ''
      };
    } else {
      this.editingProduct.set(null);
      this.formData = { quantity_in_stock: 0, reorder_level: 10, gallery_string: '', sizes_string: '', category_target: '' };
    }
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.formData = {};
  }

  saveProduct() {
    const payload: any = {
      ...this.formData,
      gallery_photos: this.formData.gallery_string 
        ? this.formData.gallery_string.split(',').map((s: string) => s.trim()).filter(Boolean) 
        : [],
      sizes: this.formData.sizes_string 
        ? this.formData.sizes_string.split(',').map((s: string) => s.trim().toUpperCase()).filter(Boolean) 
        : []
    };

    if (this.formData.category_target) {
      const [id, name] = this.formData.category_target.split('|');
      payload.category = { category_id: id, category_name: name };
    }

    const isEditing = !!this.editingProduct();
    const ob = isEditing
      ? this.apiService.updateProduct(this.editingProduct()._id, payload)
      : this.apiService.createProduct(payload);

    ob.subscribe({
      next: () => {
        this.closeModal();
        this.loadProducts();
        Swal.fire({
          title: 'Success!',
          text: `Product successfully ${isEditing ? 'updated' : 'added'}!`,
          icon: 'success',
          confirmButtonColor: 'var(--primary)',
          background: 'var(--surface)',
          color: 'var(--text)'
        });
      },
      error: (err) => {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to save product: ' + (err.error?.message || err.message),
          icon: 'error',
          confirmButtonColor: 'var(--red)',
          background: 'var(--surface)',
          color: 'var(--text)'
        });
      }
    });
  }

  deleteProduct(id: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--red)',
      cancelButtonColor: 'var(--surface2)',
      confirmButtonText: 'Yes, delete it!',
      background: 'var(--surface)',
      color: 'var(--text)'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteProduct(id).subscribe({
          next: () => {
            this.loadProducts();
            Swal.fire({
              title: 'Deleted!',
              text: 'The product has been deleted.',
              icon: 'success',
              confirmButtonColor: 'var(--primary)',
              background: 'var(--surface)',
              color: 'var(--text)'
            });
          },
          error: (err) => {
            Swal.fire({
              title: 'Error!',
              text: 'Failed to delete product',
              icon: 'error',
              confirmButtonColor: 'var(--red)',
              background: 'var(--surface)',
              color: 'var(--text)'
            });
          }
        });
      }
    });
  }
}
