import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { Dashboard } from './components/dashboard/dashboard';
import { Products } from './components/products/products';
import { Categories } from './components/categories/categories';
import { Suppliers } from './components/suppliers/suppliers';
import { Customers } from './components/customers/customers';
import { Sales } from './components/sales/sales';
import { BakongPaymentComponent } from './components/bakong-payment/bakong-payment.component';
import { StoreComponent } from './components/client/store/store';

import { adminGuard, authGuard } from './guards/auth.guard';
import { LoginComponent } from './components/auth/login';

export const routes: Routes = [
  { path: '', redirectTo: 'store', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'store', component: StoreComponent }, // Assuming Store is public or needs client check? (Client makes sense)
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard, adminGuard], // Protect admin dashboard
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'products', component: Products },
      { path: 'categories', component: Categories },
      { path: 'suppliers', component: Suppliers },
      { path: 'customers', component: Customers },
      { path: 'sales', component: Sales },
      { path: 'pos', component: BakongPaymentComponent },
    ]
  },
  { path: '**', redirectTo: 'store' },
];
