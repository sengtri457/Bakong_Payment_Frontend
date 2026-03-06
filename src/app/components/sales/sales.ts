import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Sales History</h1>
        <p class="page-subtitle">Track all completed transactions and Bakong payments</p>
      </div>
    </div>

    <div class="table-container">
      <table class="premium-table">
        <thead>
          <tr>
            <th>Sale ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Items</th>
            <th>Total Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let s of sales()">
            <td style="font-family: monospace; color: var(--accent);">{{ s._id?.substring(0,8) }}</td>
            <td><strong>{{ s.customer_name || 'Walk-in' }}</strong></td>
            <td>{{ s.sale_date | date:'medium' }}</td>
            <td>{{ s.items?.length || 0 }} items</td>
            <td style="font-weight:bold;">\${{ s.total_amount?.toFixed(2) }}</td>
            <td>
              <span class="badge" [ngClass]="s.payment_status === 'PAID' ? 'badge-success' : 'badge-warning'">
                {{ s.payment_status }}
              </span>
            </td>
          </tr>
          <tr *ngIf="sales().length === 0">
            <td colspan="6" class="empty-state">No sales records found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 2rem; }
    .empty-state { text-align: center; padding: 3rem; color: var(--muted); }
  `]
})
export class Sales implements OnInit {
  sales = signal<any[]>([]);

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getSales().subscribe((res: any) => {
      this.sales.set(res.data || res || []);
    });
  }
}
