import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Suppliers</h1>
        <p class="page-subtitle">Manage your product suppliers</p>
      </div>
    </div>

    <div class="table-container">
      <table class="premium-table">
        <thead>
          <tr>
            <th>Company Name</th>
            <th>Contact Person</th>
            <th>Email</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let s of suppliers()">
            <td><strong>{{ s.supplier_name }}</strong></td>
            <td>{{ s.contact_person || '-' }}</td>
            <td><a [href]="'mailto:'+s.email" style="color:var(--accent); text-decoration:none">{{ s.email || '-' }}</a></td>
            <td>{{ s.phone || '-' }}</td>
          </tr>
          <tr *ngIf="suppliers().length === 0">
            <td colspan="4" class="empty-state">No suppliers found.</td>
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
export class Suppliers implements OnInit {
  suppliers = signal<any[]>([]);

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getSuppliers().subscribe((res: any) => {
      this.suppliers.set(res.data || res || []);
    });
  }
}
