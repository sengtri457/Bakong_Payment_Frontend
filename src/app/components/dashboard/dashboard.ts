import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Welcome back! Here's what's happening today.</p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon bg-blue">📦</div>
        <div class="stat-info">
          <span class="stat-label">Total Products</span>
          <span class="stat-value">{{ productsCount() }}</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon bg-green">🚚</div>
        <div class="stat-info">
          <span class="stat-label">Suppliers</span>
          <span class="stat-value">{{ suppliersCount() }}</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon bg-purple">👥</div>
        <div class="stat-info">
          <span class="stat-label">Customers</span>
          <span class="stat-value">{{ customersCount() }}</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon bg-amber">📈</div>
        <div class="stat-info">
          <span class="stat-label">Recent Sales</span>
          <span class="stat-value">{{ salesCount() }}</span>
        </div>
      </div>
    </div>

    <div class="recent-section">
      <div class="section-card">
        <h3 class="card-title">Low Stock Alert</h3>
        <div class="table-container">
          <table class="premium-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Stock Level</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of lowStockProducts()">
                <td>{{ p.product_name }}</td>
                <td>
                  <span class="badge badge-danger">{{ p.quantity_in_stock }}</span>
                </td>
                <td><button class="btn btn-primary" style="padding: 0.3rem 0.8rem; font-size:0.75rem;">Reorder</button></td>
              </tr>
              <tr *ngIf="lowStockProducts().length === 0">
                <td colspan="3" class="empty-state">No low stock items. All good!</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="section-card">
        <h3 class="card-title">Recent Sales Activity</h3>
        <div class="table-container">
          <table class="premium-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of recentSales()">
                <td style="font-family: monospace; color: var(--accent);">{{ s._id?.substring(0,8) }}</td>
                <td style="font-weight:bold;">\${{ s.total_amount?.toFixed(2) }}</td>
                <td><span class="badge" [ngClass]="s.payment_status === 'PAID' ? 'badge-success' : 'badge-warning'">{{ s.payment_status }}</span></td>
              </tr>
              <tr *ngIf="recentSales().length === 0">
                <td colspan="3" class="empty-state">No recent sales.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 2rem; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2.5rem;
    }
    .stat-card {
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }
    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
    }
    .bg-blue { background: rgba(79, 142, 247, 0.15); color: var(--accent); }
    .bg-green { background: rgba(34, 197, 94, 0.15); color: var(--green); }
    .bg-purple { background: rgba(124, 92, 252, 0.15); color: var(--accent2); }
    .bg-amber { background: rgba(245, 158, 11, 0.15); color: var(--amber); }
    
    .stat-info { display: flex; flex-direction: column; gap: 0.25rem; }
    .stat-label { font-size: 0.85rem; color: var(--muted); font-weight: 500; }
    .stat-value { font-size: 1.75rem; font-weight: 800; color: #fff; line-height: 1; }
    
    .recent-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }
    .section-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .card-title {
      font-size: 1.1rem;
      color: var(--text);
      font-weight: 600;
      margin: 0;
    }
    
    @media (max-width: 900px) {
      .recent-section { grid-template-columns: 1fr; }
    }
  `]
})
export class Dashboard implements OnInit {
  productsCount = signal(0);
  suppliersCount = signal(0);
  customersCount = signal(0);
  salesCount = signal(0);
  
  lowStockProducts = signal<any[]>([]);
  recentSales = signal<any[]>([]);

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getProducts().subscribe((res: any) => {
      const prods = res.data || res || [];
      this.productsCount.set(prods.length);
      this.lowStockProducts.set(prods.filter((p: any) => p.quantity_in_stock <= p.reorder_level).slice(0, 5));
    });
    
    this.apiService.getSuppliers().subscribe((res: any) => {
      this.suppliersCount.set((res.data || res || []).length);
    });
    
    this.apiService.getCustomers().subscribe((res: any) => {
      this.customersCount.set((res.data || res || []).length);
    });
    
    this.apiService.getSales().subscribe((res: any) => {
      const sales = res.data || res || [];
      this.salesCount.set(sales.length);
      this.recentSales.set(sales.slice(0, 5));
    });
  }
}
