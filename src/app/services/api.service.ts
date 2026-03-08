import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroment/enviroment';
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // Products
  getProducts(): Observable<any> { return this.http.get(`${this.baseUrl}/products`); }
  createProduct(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/products`, data); }
  updateProduct(id: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/products/${id}`, data); }
  deleteProduct(id: string): Observable<any> { return this.http.delete(`${this.baseUrl}/products/${id}`); }
  updateStock(id: string, data: {quantity: number, type: 'IN'|'OUT'|'ADJUSTMENT', notes?: string}): Observable<any> { 
    return this.http.put(`${this.baseUrl}/products/${id}/stock`, data); 
  }

  // Categories
  getCategories(): Observable<any> { return this.http.get(`${this.baseUrl}/categories`); }
  createCategory(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/categories`, data); }

  // Suppliers
  getSuppliers(): Observable<any> { return this.http.get(`${this.baseUrl}/suppliers`); }
  createSupplier(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/suppliers`, data); }

  // Customers
  getCustomers(): Observable<any> { return this.http.get(`${this.baseUrl}/customers`); }

  // Sales
  getSales(): Observable<any> { return this.http.get(`${this.baseUrl}/sales`); }
  createSale(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/sales`, data); }
  getSalesStats(): Observable<any> { return this.http.get(`${this.baseUrl}/sales/stats/overview`); }
  getBestSellers(limit: number = 5): Observable<any> { return this.http.get(`${this.baseUrl}/sales/best-sellers?limit=${limit}`); }
  getSalesByRange(start: string, end: string): Observable<any> { 
    return this.http.get(`${this.baseUrl}/sales/date-range?start=${start}&end=${end}`); 
  }

  // Purchases
  getPurchases(): Observable<any> { return this.http.get(`${this.baseUrl}/purchases`); }
  createPurchase(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/purchases`, data); }
  updatePurchaseStatus(id: string, status: 'PENDING'|'RECEIVED'|'CANCELLED'): Observable<any> {
    return this.http.put(`${this.baseUrl}/purchases/${id}/status`, { status });
  }
}
