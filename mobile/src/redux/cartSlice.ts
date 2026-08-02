import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../types';

export interface CartItem {
  product: Product;
  qty: number;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Product>) => {
      const existing = state.items.find((item) => item.product.id === action.payload.id);
      if (existing) {
        existing.qty += 1;
      } else {
        state.items.push({ product: action.payload, qty: 1 });
      }
    },
    updateQuantity: (state, action: PayloadAction<{ productId: string; qty: number }>) => {
      const item = state.items.find((i) => i.product.id === action.payload.productId);
      if (item) {
        item.qty = Math.max(1, action.payload.qty);
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.product.id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, item) => sum + item.product.price * item.qty, 0);
