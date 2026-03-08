import { Injectable, signal, computed } from '@angular/core';
import { Product, CartItem } from './bakong.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  cart = signal<CartItem[]>([]);
  
  cartCount = computed(() => this.cart().reduce((sum, i) => sum + i.quantity, 0));
  total = computed(() => this.cart().reduce((sum, i) => sum + i.product.unit_price * i.quantity, 0));

  addToCart(product: Product) {
    const existing = this.cart().find(i => i.product._id === product._id);
    if (existing) {
      this.changeQty(product._id, undefined, 1);
    } else {
      this.cart.update(c => [...c, { product, quantity: 1, size: undefined }]);
    }
  }

  changeQty(id: string, size: string | undefined, delta: number) {
    this.cart.update(items => items.map(i => {
      if (i.product._id === id && i.size === size) {
        const newQty = Math.max(0, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }).filter(i => i.quantity > 0));
  }

  removeFromCart(id: string, size: string | undefined) {
    this.cart.update(items => items.filter(i => !(i.product._id === id && i.size === size)));
  }

  clearCart() {
    this.cart.set([]);
  }
}
