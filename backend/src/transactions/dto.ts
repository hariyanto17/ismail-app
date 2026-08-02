import { PaymentMethod } from '@prisma/client';

export interface CreateTransactionItemDto {
  product_id: string;
  qty: number;
}

export interface CreateTransactionDto {
  payment_method: PaymentMethod;
  paid_amount: number;
  items: CreateTransactionItemDto[];
}

export interface TransactionItemResponseDto {
  id: string;
  product_id: string;
  product_name: string;
  qty: number;
  price: number;
  subtotal: number;
}

export interface TransactionResponseDto {
  id: string;
  invoice_number: string;
  cashier_id: string;
  cashier_name: string;
  payment_method: PaymentMethod;
  total: number;
  paid_amount: number;
  change_amount: number;
  created_at: Date;
  updated_at: Date;
  items: TransactionItemResponseDto[];
}
