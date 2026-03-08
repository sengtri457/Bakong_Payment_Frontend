import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,RouterOutlet,RouterLink],
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

        <!-- Top Selling Products -->
        <div class="luxe-card top-sellers">
          <div class="card-header">
            <h3 class="card-t">Top Selling Products</h3>
          </div>
          <div class="product-list">
            @for (p of topSellers(); track p._id) {
              <div class="p-item">
                <div class="p-img">
                   <img [src]="'/api/products/image/' + p._id" onerror="this.src='https://placehold.co/100x100/fdf2f4/ff3366?text=Ritual'" alt="product" />
                </div>
                <div class="p-info">
                  <span class="p-name">{{ p.product_name }}</span>
                  <span class="p-count">{{ p.total_quantity_sold }} units sold</span>
                </div>
                <div class="p-price">\${{ p.unit_price?.toFixed(2) }}</div>
              </div>
            }
            @if (topSellers().length === 0) {
              <div class="empty-state">No sales yet.</div>
            }
          </div>
          <button class="luxe-btn-outline" routerLink="/products">View All Products</button>
        </div>
      </div>

      <!-- Recent Orders Section -->
      <div class="luxe-card table-card">
        <div class="card-header">
          <h3 class="card-t">Recent Orders</h3>
          <button class="luxe-link">Export CSV</button>
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

    /* Main Grid */
    .main-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
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

    /* Top Sellers */
    .product-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .p-item {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 0.5rem;
      border-radius: 14px;
      transition: background 0.2s;
    }
    .p-item:hover { background: #f8fafc; }
    .p-img {
      width: 52px;
      height: 52px;
      background: #f1f5f9;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }
    .p-img img { width: 100%; height: 100%; object-fit: cover; }
    .p-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .p-name { font-size: 0.95rem; font-weight: 700; color: var(--luxe-text); }
    .p-count { font-size: 0.8rem; color: #64748b; font-weight: 600;}
    .p-price { font-size: 1rem; font-weight: 800; color: var(--luxe-primary); }

    .luxe-btn-outline {
      width: 100%;
      background: #ffffff;
      border: 1.5px solid #eef0f7;
      border-radius: 14px;
      padding: 0.9rem;
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--luxe-text);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .luxe-btn-outline:hover { 
      background: var(--luxe-text); 
      color: #fff; 
      border-color: var(--luxe-text);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    }

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
    Swal.fire({
      title: 'Formal Reorder (PO)',
      text: `Create a Purchase Order for ${product.product_name}?`,
      input: 'number',
      inputAttributes: { min: '1', step: '1' },
      inputValue: 50,
      showCancelButton: true,
      confirmButtonText: 'Generate PO',
      confirmButtonColor: 'var(--primary)',
      background: 'var(--surface)',
      color: 'var(--text)',
      inputValidator: (value) => {
        if (!value || parseInt(value) <= 0) return 'Please enter a valid quantity';
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const orderQty = parseInt(result.value);
        
        // Find a valid supplier fallback
        const defaultSupplier = this.suppliers()[0] || { _id: '000000000000000000000001', supplier_name: 'Direct Supplier' };
        
        const purchaseData = {
          supplier_id: product.supplier?.supplier_id || defaultSupplier._id,
          supplier_name: product.supplier?.supplier_name || defaultSupplier.supplier_name,
          items: [{
            product_id: product._id,
            product_name: product.product_name,
            product_code: product.product_code,
            quantity: orderQty,
            purchase_cost: (product.unit_price || 0) * 0.6
          }],
          notes: `Automatic reorder from dashboard due to low stock.`
        };

        this.apiService.createPurchase(purchaseData).subscribe({
          next: (res: any) => {
            Swal.fire({
              title: 'PO Created!',
              text: `Purchase Order #${res.data._id.slice(-6).toUpperCase()} created. Stock updates on "RECEIVED".`,
              icon: 'success',
              confirmButtonColor: 'var(--primary)',
              background: 'var(--surface)',
              color: 'var(--text)'
            });
            this.refreshData();
          },
          error: (err) => {
            const errorMsg = err.error?.error || err.error?.message || err.message;
            Swal.fire({
              title: 'Error!',
              text: 'Failed: ' + errorMsg,
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
