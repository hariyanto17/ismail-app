export type Role = 'ADMIN' | 'CASHIER';

export interface User {
  id: string;
  username: string;
  full_name: string;
  role: Role;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  category_name?: string;
  name: string;
  price: number;
  is_active: boolean;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionItem {
  id: string;
  product_id: string;
  product_name: string;
  qty: number;
  price: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  invoice_number: string;
  cashier_id: string;
  cashier_name: string;
  payment_method: 'CASH' | 'QRIS';
  total: number;
  paid_amount: number;
  change_amount: number;
  created_at: string;
  updated_at: string;
  items: TransactionItem[];
}
