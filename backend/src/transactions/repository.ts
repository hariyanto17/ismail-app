import prisma from '../config/prisma';
import { Transaction, TransactionItem, Product, User, Prisma } from '@prisma/client';

export type TransactionWithDetails = Transaction & {
  cashier: User;
  items: (TransactionItem & {
    product: Product;
  })[];
};

export class TransactionRepository {
  async findAll(): Promise<TransactionWithDetails[]> {
    return prisma.transaction.findMany({
      include: {
        cashier: true,
        items: {
          include: { product: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findById(id: string): Promise<TransactionWithDetails | null> {
    return prisma.transaction.findUnique({
      where: { id },
      include: {
        cashier: true,
        items: {
          include: { product: true },
        },
      },
    });
  }

  async countTodayTransactions(startOfDay: Date, endOfDay: Date): Promise<number> {
    return prisma.transaction.count({
      where: {
        created_at: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
  }

  async create(data: {
    invoice_number: string;
    cashier_id: string;
    payment_method: 'CASH' | 'QRIS';
    total: number;
    paid_amount: number;
    change_amount: number;
    items: {
      product_id: string;
      qty: number;
      price: number;
      subtotal: number;
    }[];
  }): Promise<TransactionWithDetails> {
    // Run everything in a Prisma transaction
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Create Transaction header
      const transaction = await tx.transaction.create({
        data: {
          invoice_number: data.invoice_number,
          cashier_id: data.cashier_id,
          payment_method: data.payment_method,
          total: data.total,
          paid_amount: data.paid_amount,
          change_amount: data.change_amount,
        },
      });

      // 2. Create Transaction items
      await tx.transactionItem.createMany({
        data: data.items.map((item) => ({
          transaction_id: transaction.id,
          product_id: item.product_id,
          qty: item.qty,
          price: item.price,
          subtotal: item.subtotal,
        })),
      });

      // 3. Retrieve completed transaction details
      const fullTransaction = await tx.transaction.findUnique({
        where: { id: transaction.id },
        include: {
          cashier: true,
          items: {
            include: { product: true },
          },
        },
      });

      if (!fullTransaction) {
        throw new Error('Transaction creation failed');
      }

      return fullTransaction;
    });
  }
}
