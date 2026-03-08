import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-purchases',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Purchase Orders</h1>
        <p class="page-subtitle">Track and manage stock reorders from suppliers.</p>
      </div>
    </div>

    <div class="table-container">
      <table class="premium-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Supplier</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of purchases()">
            <td><code style="color:var(--accent)">#{{ p._id.slice(-6).toUpperCase() }}</code></td>
            <td><strong>{{ p.supplier_name }}</strong></td>
            <td>{{ p.purchase_date | date:'mediumDate' }}</td>
            <td><strong>\${{ p.total_amount?.toFixed(2) }}</strong></td>
            <td>
              <span class="badge" 
                [ngClass]="{
                  'badge-success': p.status === 'RECEIVED',
                  'badge-warning': p.status === 'PENDING',
                  'badge-danger': p.status === 'CANCELLED'
                }">
                {{ p.status }}
              </span>
            </td>
            <td>
              <div style="display: flex; gap: 0.5rem;" *ngIf="p.status === 'PENDING'">
                <button class="btn btn-success" style="padding: 0.3rem 0.6rem; font-size:0.7rem;" (click)="receiveOrder(p)">
                  Mark Received
                </button>
                <button class="btn btn-danger" style="padding: 0.3rem 0.6rem; font-size:0.7rem;" (click)="cancelOrder(p)">
                  Cancel
                </button>
              </div>
              <span *ngIf="p.status !== 'PENDING'" style="color:var(--muted); font-size:0.8rem">Completed</span>
            </td>
          </tr>
          <tr *ngIf="purchases().length === 0">
            <td colspan="6" class="empty-state">No purchase orders found.</td>
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
export class Purchases implements OnInit {
  purchases = signal<any[]>([]);

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.apiService.getPurchases().subscribe((res: any) => {
      this.purchases.set(res.data || []);
    });
  }

  receiveOrder(purchase: any) {
    Swal.fire({
      title: 'Confirm Delivery',
      text: `Are you sure you have received ${purchase.items.length} items from ${purchase.supplier_name}? Stock will be updated.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Receive Stock',
      confirmButtonColor: 'var(--green)',
      background: 'var(--surface)',
      color: 'var(--text)'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.updatePurchaseStatus(purchase._id, 'RECEIVED').subscribe({
          next: () => {
            Swal.fire('Stock Updated!', 'Inventory has been incremented.', 'success');
            this.refresh();
          },
          error: (err) => {
            Swal.fire('Error', err.error?.message || 'Failed to update stock', 'error');
          }
        });
      }
    });
  }

  cancelOrder(purchase: any) {
    Swal.fire({
      title: 'Cancel PO?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel',
      confirmButtonColor: 'var(--red)',
      background: 'var(--surface)',
      color: 'var(--text)'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.updatePurchaseStatus(purchase._id, 'CANCELLED').subscribe({
          next: () => {
            Swal.fire('Cancelled', 'Purchase order has been marked as cancelled.', 'info');
            this.refresh();
          }
        });
      }
    });
  }
}
