import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Categories</h1>
        <p class="page-subtitle">Manage product categories</p>
      </div>
    </div>

    <div class="table-container">
      <table class="premium-table">
        <thead>
          <tr>
            <th>Category Name</th>
            <th>Description</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let c of categories()">
            <td><strong>{{ c.category_name }}</strong></td>
            <td>{{ c.description }}</td>
            <td>{{ c.created_at | date }}</td>
          </tr>
          <tr *ngIf="categories().length === 0">
            <td colspan="3" class="empty-state">No categories found.</td>
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
export class Categories implements OnInit {
  categories = signal<any[]>([]);

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getCategories().subscribe((res: any) => {
      this.categories.set(res.data || res || []);
    });
  }
}
