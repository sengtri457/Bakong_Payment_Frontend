import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <div class="dash-header">
        <h1 class="dash-title">Dashboard Overview</h1>
        <div class="dash-actions">
          <div class="simple-search">
            <span class="icon">🔍</span>
            <input type="text" placeholder="Search data..." />
          </div>
          <button class="luxe-reload-btn" (click)="refreshData()" [class.spinning]="isRefreshing()">
            <span class="icon">🔄</span>
          </button>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="stats-row">
        <div class="luxe-card stat">
          <div class="stat-top">
            <div class="s-icon purple">💳</div>
            <div class="s-trend up">
              <span class="trend-icon">↗</span> 12.5%
            </div>
          </div>
          <div class="stat-meta">Total Revenue</div>
          <div class="stat-qty">\${{ stats()?.total_revenue || '0.00' }}</div>
        </div>

        <div class="luxe-card stat">
          <div class="stat-top">
            <div class="s-icon pink">🛍️</div>
            <div class="s-trend down">
              <span class="trend-icon">↘</span> 2.4%
            </div>
          </div>
          <div class="stat-meta">Total Orders</div>
          <div class="stat-qty">{{ stats()?.paid_sales || 0 | number }}</div>
        </div>

        <div class="luxe-card stat">
          <div class="stat-top">
            <div class="s-icon teal">👥</div>
            <div class="s-trend up">
              <span class="trend-icon">↗</span> 18%
            </div>
          </div>
          <div class="stat-meta">Total Transactions</div>
          <div class="stat-qty">{{ stats()?.total_sales || 0 | number }}</div>
        </div>
      </div>

      <!-- Main Content Row -->
      <div class="main-grid">
        <!-- Revenue Performance -->
        <div class="luxe-card chart-view">
          <div class="card-header">
            <div>
              <h3 class="card-t">Revenue Performance</h3>
              <p class="card-st">Monthly overview of sales revenue</p>
            </div>
            <select class="luxe-select" (change)="onTimeframeChange($event)">
              <option value="7">Last 7 Days (Daily)</option>
              <option value="30">Last 30 Days (Weekly)</option>
            </select>
          </div>
          
          <div class="bar-chart" [class.weekly-view]="timeframe() === '30'">
            @for (item of revenueData(); track item.label) {
              <div class="bar-item">
                <div class="bar-pillar-wrapper">
                  <div class="bar-pillar" 
                    [style.height.%]="item.val" 
                    [class.has-revenue]="item.revenue > 0"
                    [class.highlight]="item.val >= 99 && item.revenue > 0">
                    <div class="tooltip" *ngIf="item.revenue > 0">\${{ item.revenue?.toLocaleString() }}</div>
                  </div>
                </div>
                <span class="bar-label">{{ item.label }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Side Insights -->
        <div class="side-content">
          <!-- Top Selling Products -->
          <div class="luxe-card top-sellers">
            <div class="card-header">
              <h3 class="card-t">Top Sellers</h3>
            </div>
            <div class="product-list">
              @for (p of topSellers(); track p._id) {
                <div class="p-item">
                  <div class="p-img">
                     <img [src]="'/api/products/image/' + p._id" onerror="this.src='https://placehold.co/100x100/fdf2f4/ff3366?text=Cosmetic'" alt="product" />
                  </div>
                  <div class="p-info">
                    <span class="p-name">{{ p.product_name }}</span>
                    <span class="p-count">{{ p.total_quantity_sold }} sold</span>
                  </div>
                  <div class="p-price">\${{ p.unit_price?.toFixed(2) }}</div>
                </div>
              }
              @if (topSellers().length === 0) {
                <div class="empty-state">No sales yet.</div>
              }
            </div>
          </div>

          <!-- Low Stock Alerts -->
          <div class="luxe-card low-stock-alerts" *ngIf="lowStockProducts().length > 0">
            <div class="card-header">
              <h3 class="card-t">Stock Alerts</h3>
              <span class="alert-badge">{{ lowStockProducts().length }}</span>
            </div>
            <div class="alert-list">
              @for (p of lowStockProducts(); track p._id) {
                <div class="alert-item">
                  <div class="alert-icon">⚠️</div>
                  <div class="alert-details">
                    <div class="p-name">{{ p.product_name }}</div>
                    <div class="p-stock">
                      Only <span class="qty">{{ p.quantity_in_stock }}</span> remaining
                    </div>
                  </div>
                  <button class="mini-reorder-btn" (click)="reorder(p)">Reorder</button>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Orders Section -->
      <div class="luxe-card table-card">
        <div class="card-header">
          <h3 class="card-t">Recent Orders</h3>
          <button class="luxe-link" (click)="exportToCSV()">Export CSV</button>
        </div>
        <div class="luxe-table-wrapper">
          <table class="luxe-table">
            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>CUSTOMER</th>
                <th>DATE</th>
                <th>STATUS</th>
                <th>AMOUNT</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              @for (s of recentSales(); track s._id) {
                <tr>
                  <td class="id-cell">#{{ s._id?.substring(18,24).toUpperCase() }}</td>
                  <td>
                    <div class="cust-cell">
                      <div class="cust-avatar">{{ s.customer_name?.charAt(0) }}</div>
                      <span>{{ s.customer_name || 'Walk-in' }}</span>
                    </div>
                  </td>
                  <td class="date-cell">{{ (s.sale_date || s.createdAt) | date:'MMM dd, yyyy' }}</td>
                  <td>
                    <span class="l-pill" [class]="s.payment_status.toLowerCase()">
                      {{ s.payment_status }}
                    </span>
                  </td>
                  <td class="amount-cell">\${{ s.total_amount?.toFixed(2) }}</td>
                  <td>
                    <button class="more-btn">•••</button>
                  </td>
                </tr>
              }
              @if (recentSales().length === 0) {
                <tr><td colspan="6" class="empty">No recent orders found.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background: var(--luxe-bg);
      min-height: 100%;
    }

    .dashboard-container {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 2rem;
      padding-bottom: 2rem;
      animation: fadeIn 0.8s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Header */
    .dash-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .dash-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--luxe-text);
      letter-spacing: -0.03em;
      margin: 0;
    }
    .dash-actions {
      display: flex;
      gap: 1rem;
    }
    .simple-search {
      display: flex;
      align-items: center;
      background: #ffffff;
      border: 1px solid #eef0f7;
      border-radius: 14px;
      padding: 0.6rem 1.25rem;
      width: 300px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.02);
      transition: all 0.3s ease;
    }
    .simple-search:focus-within {
      border-color: var(--luxe-primary);
      box-shadow: 0 4px 12px rgba(255, 51, 102, 0.1);
    }
    .simple-search .icon { font-size: 0.9rem; opacity: 0.5; }
    .simple-search input {
      background: none;
      border: none;
      outline: none;
      font-size: 0.9rem;
      width: 100%;
      margin-left: 0.75rem;
      color: var(--luxe-text);
      font-weight: 500;
    }

    .luxe-reload-btn {
      width: 46px;
      height: 46px;
      background: #ffffff;
      border: 1px solid #eef0f7;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 2px 6px rgba(0,0,0,0.02);
      font-size: 1.1rem;
    }

    .luxe-reload-btn:hover {
      border-color: var(--luxe-primary);
      color: var(--luxe-primary);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 51, 102, 0.1);
    }

    .luxe-reload-btn.spinning .icon {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Stats Cards - Premium Modern Look */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }
    .luxe-card {
      background: #ffffff;
      border-radius: 20px;
      padding: 1.75rem;
      border: 1px solid #f1f3f9;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
      position: relative;
      overflow: hidden;
    }
    .stat {
      transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    }
    .stat:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 30px rgba(0,0,0,0.08);
      border-color: rgba(255, 51, 102, 0.1);
    }
    .stat-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }
    .s-icon {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      position: relative;
      z-index: 1;
    }
    .s-icon::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      opacity: 0.12;
      z-index: -1;
    }
    .s-icon.purple { color: #8b5cf6; }
    .s-icon.purple::after { background: #8b5cf6; }
    .s-icon.pink { color: #ff3366; }
    .s-icon.pink::after { background: #ff3366; }
    .s-icon.teal { color: #0d9488; }
    .s-icon.teal::after { background: #0d9488; }

    .s-trend {
      font-size: 0.8rem;
      font-weight: 700;
      padding: 0.35rem 0.75rem;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 4px;
      background: #f8fafc;
    }
    .s-trend.up { color: #10b981; background: #ecfdf5; }
    .s-trend.down { color: #f43f5e; background: #fef2f2; }

    .stat-meta {
      font-size: 0.95rem;
      font-weight: 600;
      color: #64748b;
      margin-bottom: 0.5rem;
    }
    .stat-qty {
      font-size: 2rem;
      font-weight: 800;
      color: var(--luxe-text);
      letter-spacing: -0.04em;
    }

    /* Main Grid & Side Content */
    .main-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 1.5rem;
      align-items: start;
    }
    .side-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .card-t { font-size: 1.25rem; font-weight: 800; color: var(--luxe-text); margin: 0; letter-spacing: -0.02em; }
    .card-st { font-size: 0.9rem; color: #94a3b8; margin: 4px 0 0; font-weight: 500; }
    
    .luxe-select {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 0.6rem 1rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--luxe-text);
      outline: none;
      cursor: pointer;
      transition: all 0.2s;
    }
    .luxe-select:hover { border-color: var(--luxe-primary); }

    /* Modern Bar Chart Styles */
    .bar-chart {
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      height: 380px;
      padding: 2rem 1rem;
      gap: 1.5rem;
      background: linear-gradient(to top, #fbfbfd, #ffffff);
      border-radius: 16px;
    }
    .bar-item {
      flex: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .bar-pillar-wrapper {
      flex: 1;
      width: 100%;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding-bottom: 4px; border-bottom: 2px solid #f8fafc;
    }
    .bar-pillar {
      width: 42px;
      background: #f1f5f9;
      border-radius: 12px 12px 6px 6px;
      min-height: 4px;
      transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      position: relative;
    }
    
    .bar-pillar.has-revenue {
      background: linear-gradient(180deg, #ff5e95 0%, var(--luxe-primary) 100%);
      box-shadow: 0 4px 10px rgba(255, 51, 102, 0.15);
    }

    .bar-pillar.highlight {
      box-shadow: 0 8px 20px rgba(255, 51, 102, 0.35);
      transform: scaleX(1.15);
    }

    .tooltip {
      position: absolute;
      top: -35px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--luxe-text);
      color: white;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 0.7rem;
      font-weight: 700;
      opacity: 0;
      transition: all 0.2s;
      pointer-events: none;
      white-space: nowrap;
      z-index: 10;
    }

    .bar-item:hover .tooltip {
      opacity: 1;
      top: -42px;
    }

    .bar-item:hover .bar-pillar.has-revenue {
      filter: brightness(1.1);
    }
    .bar-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: 0.05em;
    }

    /* Top Sellers & Alert Mini Styles */
    .product-list, .alert-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .p-item, .alert-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      border-radius: 12px;
      background: #f8fafc;
      transition: all 0.2s ease;
    }
    .p-item:hover { background: #f1f5f9; transform: translateX(4px); }
    
    .p-img {
      width: 44px;
      height: 44px;
      background: #ffffff;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border: 1px solid #eef0f7;
    }
    .p-img img { width: 100%; height: 100%; object-fit: cover; }
    
    .p-info, .alert-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .p-name { font-size: 0.9rem; font-weight: 700; color: var(--luxe-text); }
    .p-count { font-size: 0.75rem; color: #64748b; font-weight: 600;}
    .p-price { font-size: 0.95rem; font-weight: 800; color: var(--luxe-primary); }

    /* Low Stock Specifics */
    .low-stock-alerts {
      border-left: 4px solid #f43f5e;
    }
    .alert-badge {
      background: #fef2f2;
      color: #e11d48;
      font-size: 0.75rem;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 20px;
      box-shadow: 0 4px 10px rgba(244, 63, 94, 0.1);
    }
    .alert-icon { font-size: 1.2rem; filter: drop-shadow(0 0 4px rgba(244, 63, 94, 0.2)); }
    .p-stock { font-size: 0.75rem; color: #64748b; font-weight: 600; }
    .p-stock .qty { color: #e11d48; font-weight: 800; }
    
    .mini-reorder-btn {
      background: var(--luxe-primary);
      color: white;
      border: none;
      padding: 0.5rem 0.85rem;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .mini-reorder-btn:hover { background: #000; transform: scale(1.05); }

    /* Table Section */
    .table-card { padding: 2rem 0; }
    .table-card .card-header { padding: 0 2rem 1.5rem; margin-bottom: 0; }
    .luxe-link {
      background: #fdf2f4;
      border: none;
      color: var(--luxe-primary);
      font-size: 0.85rem;
      font-weight: 700;
      padding: 0.5rem 1rem;
      border-radius: 10px;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .luxe-link:hover { opacity: 0.8; }
    
    .luxe-table-wrapper { overflow-x: auto; }
    .luxe-table {
      width: 100%;
      border-collapse: collapse;
    }
    .luxe-table th {
      padding: 1rem 2rem;
      text-align: left;
      font-size: 0.75rem;
      font-weight: 800;
      color: #64748b;
      background: #fafbfc;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      border-bottom: 1px solid #f1f3f9;
    }
    .luxe-table td {
      padding: 1.25rem 2rem;
      border-bottom: 1px solid #f8f9fc;
      vertical-align: middle;
      font-size: 0.95rem;
      color: #475569;
    }
    .id-cell { font-family: 'Monaco', monospace; font-weight: 600; color: #94a3b8; font-size: 0.85rem; }
    .cust-cell { display: flex; align-items: center; gap: 0.85rem; }
    .cust-cell span { font-weight: 700; color: var(--luxe-text); }
    .cust-avatar {
      width: 36px;
      height: 36px;
      border-radius: 12px;
      background: linear-gradient(135deg, #f1f3f9, #e2e8f0);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      font-weight: 800;
      color: var(--luxe-primary);
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
    }
    .date-cell { color: #64748b; font-weight: 500; }
    .amount-cell { font-weight: 800; color: var(--luxe-text); }
    
    .l-pill {
      padding: 0.45rem 0.9rem;
      border-radius: 10px;
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .l-pill::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }
    .l-pill.paid, .l-pill.delivered { background: #ecfdf5; color: #059669; }
    .l-pill.pending, .l-pill.processing { background: #fffbeb; color: #d97706; }
    .l-pill.cancelled { background: #fef2f2; color: #dc2626; }

    .more-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    .more-btn:hover { background: #f1f3f9; color: var(--luxe-text); }

    @media (max-width: 1280px) {
      .main-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 900px) {
      .stats-row { grid-template-columns: 1fr; }
      .dash-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
      .simple-search { width: 100%; }
    }
  `]
})
export class Dashboard implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  currentUser = this.authService.currentUser;
  
  productsCount = signal(0);
  suppliersCount = signal(0);
  customersCount = signal(0);
  salesCount = signal(0);
  
  lowStockProducts = signal<any[]>([]);
  recentSales = signal<any[]>([]);
  suppliers = signal<any[]>([]);
  topSellers = signal<any[]>([]);
  stats = signal<any>(null);
  revenueData = signal<any[]>([]);
  timeframe = signal<'7' | '30'>('7');
  isRefreshing = signal(false);
  private allSalesData: any[] = [];
  private refreshInterval: any;

  ngOnInit() {
    this.refreshData();
    // Auto-refresh every 30 seconds for "real-time" feel
    this.refreshInterval = setInterval(() => this.refreshData(), 30000);
  }

  ngOnDestroy() {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  refreshData() {
    this.isRefreshing.set(true);
    
    // Use forkJoin or wait for multiple calls
    this.apiService.getProducts().subscribe((res: any) => {
      const prods = (res.data || res || []).sort((a: any, b: any) => a.quantity_in_stock - b.quantity_in_stock);
      this.productsCount.set(prods.length);
      this.lowStockProducts.set(prods.filter((p: any) => p.quantity_in_stock <= p.reorder_level).slice(0, 5));
    });
    
    this.apiService.getSuppliers().subscribe((res: any) => {
      const data = res.data || res || [];
      this.suppliersCount.set(data.length);
      this.suppliers.set(data);
    });
    
    this.apiService.getCustomers().subscribe((res: any) => {
      this.customersCount.set((res.data || res || []).length);
    });
    
    this.apiService.getSales().subscribe((res: any) => {
      const sales = res.data || res || [];
      this.allSalesData = sales;
      
      const sorted = [...sales].sort((a: any, b: any) => {
        const dateA = new Date(a.sale_date || a.createdAt).getTime();
        const dateB = new Date(b.sale_date || b.createdAt).getTime();
        return dateB - dateA;
      });
      this.salesCount.set(sorted.length);
      this.recentSales.set(sorted.slice(0, 5));
      
      // Process chart from this fresh data
      this.processChartData();
    });

    this.apiService.getSalesStats().subscribe(res => {
      if (res.success) this.stats.set(res.data);
    });

    this.apiService.getBestSellers(3).subscribe(res => {
      if (res.success) this.topSellers.set(res.data);
    });

    // Stop spin after short delay for better visual feedback
    setTimeout(() => this.isRefreshing.set(false), 800);
  }

  onTimeframeChange(event: any) {
    this.timeframe.set(event.target.value);
    this.processChartData();
  }

  processChartData() {
    const sales = this.allSalesData;
    const today = new Date();
    const timeframe = this.timeframe();
    const chartResult: any[] = [];
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    const formatToYMD = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (timeframe === '7') {
      const dailyRevenue: { [key: string]: any } = {};
      
      for (let i = 0; i <= 6; i++) {
        const d = new Date();
        d.setDate(today.getDate() - (6 - i));
        const dateKey = formatToYMD(d);
        dailyRevenue[dateKey] = { label: days[d.getDay()], revenue: 0 };
      }

      sales.forEach((s: any) => {
        if ((s.payment_status || '').toUpperCase() === 'PAID') {
          const sDate = new Date(s.sale_date || s.createdAt);
          const dateKey = formatToYMD(sDate);
          if (dailyRevenue[dateKey]) dailyRevenue[dateKey].revenue += s.total_amount;
        }
      });

      const maxRev = Math.max(...Object.values(dailyRevenue).map((v: any) => v.revenue), 1);
      Object.keys(dailyRevenue).sort().forEach(key => {
        const d = dailyRevenue[key];
        // Adaptive Range: Tallest bar always 100% of height
        const displayVal = d.revenue > 0 ? (d.revenue / maxRev) * 100 : 0;
        chartResult.push({ label: d.label, val: displayVal, revenue: d.revenue });
      });
    } else {
      const weeklyRevenue = [0, 0, 0, 0];
      const weekLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      const todayN = new Date(); todayN.setHours(0,0,0,0);

      sales.forEach((s: any) => {
        if ((s.payment_status || '').toUpperCase() === 'PAID') {
          const sDate = new Date(s.sale_date || s.createdAt); sDate.setHours(0,0,0,0);
          const diffDays = Math.floor(Math.abs(todayN.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24));
          const weekIdx = Math.min(Math.floor(diffDays / 7), 3);
          weeklyRevenue[3 - weekIdx] += s.total_amount;
        }
      });

      const maxRev = Math.max(...weeklyRevenue, 1);
      weeklyRevenue.forEach((rev, i) => {
        const displayVal = rev > 0 ? (rev / maxRev) * 100 : 0;
        chartResult.push({ label: weekLabels[i], val: displayVal, revenue: rev });
      });
    }
    this.revenueData.set(chartResult);
  }

  reorder(product: any) {
    const suppliers = this.suppliers();
    if (suppliers.length === 0) {
      Swal.fire({
        title: 'No Suppliers Found',
        text: 'Please add at least one supplier to the system first.',
        icon: 'error',
        confirmButtonColor: 'var(--luxe-primary, #ff3366)',
        background: '#ffffff',
        color: '#1a1d27'
      });
      return;
    }

    const supplierOptions = suppliers.map(s => 
      `<option value="${s._id}" ${product.supplier_id === s._id ? 'selected' : ''}>${s.supplier_name}</option>`
    ).join('');

    Swal.fire({
      title: '<h2 style="font-weight: 900; letter-spacing: -0.04em; margin-bottom: 0;">Restock Inventory</h2>',
      html: `
        <div class="luxe-modal-body" style="text-align: left; padding: 20px 0;">
          <div style="background: #f8fafc; padding: 15px; border-radius: 16px; margin-bottom: 25px; border: 1px solid #eef0f7;">
            <span style="display: block; font-size: 0.7rem; color: #94a3b8; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">Active Product</span>
            <span style="font-weight: 800; color: #1a1d27; font-size: 1.15rem;">${product.product_name}</span>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; font-size: 0.75rem; color: #64748b; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Select Supplier</label>
            <select id="supplier-select" style="width: 100%; border-radius: 12px; border: 2px solid #f1f3f9; padding: 0 15px; font-weight: 700; background: #fff; height: 54px; outline: none; transition: border-color 0.2s; cursor: pointer; color: #1a1d27;">
              ${supplierOptions}
            </select>
          </div>

          <div>
            <label style="display: block; font-size: 0.75rem; color: #64748b; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Restock Quantity</label>
            <div style="position: relative;">
               <input id="reorder-qty" type="number" value="50" min="1" style="width: 100%; border-radius: 12px; border: 2px solid #f1f3f9; padding: 0 15px; font-weight: 800; background: #fff; height: 54px; outline: none; transition: border-color 0.2s; color: #ff3366; font-size: 1.2rem;">
               <span style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-weight: 700; font-size: 0.8rem;">UNITS</span>
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Create Purchase Order',
      confirmButtonColor: '#ff3366',
      cancelButtonText: 'Cancel',
      background: '#ffffff',
      color: '#1a1d27',
      padding: '2rem',
      width: '450px',
      buttonsStyling: false,
      customClass: {
        confirmButton: 'luxe-swal-confirm',
        cancelButton: 'luxe-swal-cancel',
        popup: 'luxe-swal-popup'
      },
      didOpen: () => {
        // Add custom styles to the document for this modal
        const style = document.createElement('style');
        style.innerHTML = `
          .luxe-swal-confirm {
            background: #ff3366 !important;
            color: white !important;
            padding: 14px 28px !important;
            border-radius: 14px !important;
            font-weight: 800 !important;
            border: none !important;
            margin: 0 10px !important;
            font-size: 0.95rem !important;
            cursor: pointer !important;
            box-shadow: 0 10px 20px rgba(255, 51, 102, 0.2) !important;
            transition: all 0.2s !important;
          }
          .luxe-swal-confirm:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(255, 51, 102, 0.3) !important; }
          .luxe-swal-cancel {
            background: #f1f5f9 !important;
            color: #64748b !important;
            padding: 14px 28px !important;
            border-radius: 14px !important;
            font-weight: 800 !important;
            border: none !important;
            margin: 0 10px !important;
            font-size: 0.95rem !important;
            cursor: pointer !important;
          }
          .luxe-swal-popup { border-radius: 32px !important; }
          #supplier-select:focus, #reorder-qty:focus { border-color: #ff3366 !important; }
        `;
        document.head.appendChild(style);
      },
      preConfirm: () => {
        const supplierId = (document.getElementById('supplier-select') as HTMLSelectElement).value;
        const quantity = parseInt((document.getElementById('reorder-qty') as HTMLInputElement).value);
        
        if (!supplierId) {
          Swal.showValidationMessage('Please select a supplier');
          return false;
        }
        if (!quantity || quantity <= 0) {
          Swal.showValidationMessage('Please enter a valid quantity');
          return false;
        }
        
        const selectedSupplier = suppliers.find(s => s._id === supplierId);
        return { supplierId, supplierName: selectedSupplier.supplier_name, quantity };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const { supplierId, supplierName, quantity } = result.value;
        
        const purchaseData = {
          supplier_id: supplierId,
          supplier_name: supplierName,
          items: [{
            product_id: product._id,
            product_name: product.product_name,
            product_code: product.product_code,
            quantity: quantity,
            purchase_cost: (product.unit_price || 0) * 0.6
          }],
          notes: `Dashboard reorder: ${product.product_name} x ${quantity}`
        };

        this.apiService.createPurchase(purchaseData).subscribe({
          next: (res: any) => {
            Swal.fire({
              title: 'Success!',
              text: `Purchase Order for ${product.product_name} created successfully.`,
              icon: 'success',
              confirmButtonColor: '#ff3366',
              background: '#ffffff',
              color: '#1a1d27'
            });
            this.refreshData();
          },
          error: (err) => {
            const errorMsg = err.error?.error || err.error?.message || err.message;
            Swal.fire({
              title: 'Error!',
              text: 'Failed to create PO: ' + errorMsg,
              icon: 'error',
              confirmButtonColor: '#ff3366',
              background: '#ffffff',
              color: '#1a1d27'
            });
          }
        });
      }
    });
  }

  exportToCSV() {
    const data = this.allSalesData;
    if (!data || data.length === 0) {
      Swal.fire({
        title: 'No Data',
        text: 'There are no orders to export at this time.',
        icon: 'info',
        confirmButtonColor: 'var(--luxe-primary)',
        background: 'var(--luxe-card-bg, #fff)',
        color: 'var(--luxe-text)'
      });
      return;
    }

    const headers = ['Order ID', 'Customer', 'Date', 'Status', 'Amount (USD)'];
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const s of data) {
      const row = [
        `#${s._id?.substring(18, 24).toUpperCase()}`,
        `"${s.customer_name || 'Walk-in'}"`,
        `"${new Date(s.sale_date || s.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}"`,
        s.payment_status,
        s.total_amount?.toFixed(2)
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `GLOW_Orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire({
      title: 'Export Successful',
      text: `Exported ${data.length} orders to CSV.`,
      icon: 'success',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      background: 'var(--luxe-card-bg, #fff)',
      color: 'var(--luxe-text)'
    });
  }
}
