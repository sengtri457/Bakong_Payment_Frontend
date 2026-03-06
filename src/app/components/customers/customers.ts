import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Customers</h1>
        <p class="page-subtitle">View and manage your customers</p>
      </div>
    </div>

    <div class="table-container">
      <table class="premium-table">
        <thead>
          <tr>
            <th>Customer Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Loyalty Points</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let c of customers()">
            <td><strong>{{ c.customer_name }}</strong></td>
            <td><a [href]="'mailto:'+c.email" style="color:var(--accent); text-decoration:none">{{ c.email || '-' }}</a></td>
            <td>{{ c.phone || '-' }}</td>
            <td><span class="badge badge-info">{{ c.loyalty_points || 0 }} pts</span></td>
          </tr>
          <tr *ngIf="customers().length === 0">
            <td colspan="4" class="empty-state">No customers found.</td>
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
export class Customers implements OnInit {
  customers = signal<any[]>([]);

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getCustomers().subscribe((res: any) => {
      this.customers.set(res.data || res || []);
    });
  }
}
