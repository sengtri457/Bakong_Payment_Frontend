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
}
