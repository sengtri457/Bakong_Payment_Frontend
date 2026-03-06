import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Sidebar } from './sidebar/sidebar';
import { Topbar } from './topbar/topbar';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, Sidebar, Topbar],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>
      <div class="main-content">
        <app-topbar></app-topbar>
        <div class="page-content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      height: 100vh;
      background: var(--bg, #0f1117);
      color: var(--text, #e4e8f5);
    }
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .page-content {
      flex: 1;
      padding: 1.5rem 2rem;
      overflow-y: auto;
    }
  `]
})
export class LayoutComponent {}
