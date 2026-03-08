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
import { Purchases } from './components/purchases/purchases';

import { adminGuard, authGuard } from './guards/auth.guard';
import { LoginComponent } from './components/auth/login';
import { CollectionComponent } from './components/client/collection/collection';
import { SkincareComponent } from './components/client/categories/skincare';
import { MakeupComponent } from './components/client/categories/makeup';
import { FragranceComponent } from './components/client/categories/fragrance';
import { ProductDetailComponent } from './components/client/product-detail/product-detail';

export const routes: Routes = [
  { path: '', redirectTo: 'store', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'store', component: StoreComponent },
  { path: 'collection', component: CollectionComponent },
  { path: 'skincare', component: SkincareComponent },
  { path: 'makeup', component: MakeupComponent },
  { path: 'fragrance', component: FragranceComponent },
  { path: 'product/:id', component: ProductDetailComponent },
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
      { path: 'purchases', component: Purchases },
      { path: 'pos', component: BakongPaymentComponent },
    ]
  },
  { path: '**', redirectTo: 'store' },
];
