import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * REPRESENTATION OF A SINGLE ITEM IN THE BAG
 */
export interface CartItem {
  product: Product;    
  quantity: number;
  size?: string;
}

export interface GenerateQRRequest {
  userId: string;
  items: {
    product_id: string;
    quantity: number;
    price: number;
  }[];
  total_amount: number;
  currency: 'usd' | 'khr';
  shipping_address?: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  shipping_method?: string;
  notes?: string;
}

export interface GenerateQRResponse {
  sessionId: string;
  qrString: string;
  md5: string;
  total_amount: number;
  currency: string;
  expiresAt: string;
}

export interface CheckPaymentResponse {
  isPaid: boolean;
  message: string;
  sale?: any;
}

export interface Product {
  _id: string;
  product_name: string;
  product_code: string;
  unit_price: number;
  quantity_in_stock: number;
  description?: string;
  photo?: string;
  sub_category?: string;
  category?: {
    category_id: string;
    category_name: string;
  };
  gallery_photos?: string[];
  sizes?: string[];
  skin_type?: string[];
  ingredients?: string;
  how_to_use?: string;
  benefits?: string[];
  volume?: string;
  is_vegan?: boolean;
  is_cruelty_free?: boolean;
  is_best_seller?: boolean;
}

@Injectable({ providedIn: 'root' })
export class BakongService {
  private readonly api = 'http://localhost:4001/api';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<{ success: boolean; data: Product[] }> {
    return this.http.get<{ success: boolean; data: Product[] }>(`${this.api}/products`);
  }

  generateQR(payload: GenerateQRRequest): Observable<GenerateQRResponse> {
    return this.http.post<GenerateQRResponse>(`${this.api}/bakong/generate`, payload);
  }

  checkPayment(sessionId: string): Observable<CheckPaymentResponse> {
    return this.http.post<CheckPaymentResponse>(`${this.api}/bakong/check`, { sessionId });
  }

  getBestSellers(limit: number = 8): Observable<{ success: boolean; data: Product[] }> {
    return this.http.get<{ success: boolean; data: Product[] }>(`${this.api}/products?is_best_seller=true&limit=${limit}`);
  }
}
