import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CartItem {
  product_id: string;
  quantity: number;
  remarks?: string;
}

export interface GenerateQRRequest {
  userId: string;
  items: CartItem[];
  currency: 'usd' | 'khr';
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
  gallery_photos?: string[];
  sizes?: string[];
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
}
