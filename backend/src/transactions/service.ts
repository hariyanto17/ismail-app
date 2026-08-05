import { TransactionRepository, TransactionWithDetails } from './repository';
import { CreateTransactionDto, TransactionResponseDto } from './dto';
import { BadRequestError, NotFoundError } from '../common/errors';
import prisma from '../config/prisma';
import { Product } from '@prisma/client';

import { getDateStringInTimezone, getDayRangeInTimezone } from '../common/timezone';

export class TransactionService {
  constructor(private transactionRepository: TransactionRepository) {}

  private mapToResponse(tx: TransactionWithDetails): TransactionResponseDto {
    return {
      id: tx.id,
      invoice_number: tx.invoice_number,
      cashier_id: tx.cashier_id,
      cashier_name: tx.cashier.full_name,
      payment_method: tx.payment_method,
      total: tx.total,
      paid_amount: tx.paid_amount,
      change_amount: tx.change_amount,
      created_at: tx.created_at,
      updated_at: tx.updated_at,
      items: tx.items.map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        product_name: item.product.name,
        qty: item.qty,
        price: item.price,
        subtotal: item.subtotal,
      })),
    };
  }

  private async generateInvoiceNumber(): Promise<string> {
    const now = new Date();
    const setting = await prisma.appSetting.findFirst();
    const timezone = setting?.timezone || 'Asia/Makassar';
    const dateString = getDateStringInTimezone(now, timezone);
    const dateStr = dateString.replace(/-/g, '');
    const { start, end } = getDayRangeInTimezone(dateString, timezone);

    const count = await this.transactionRepository.countTodayTransactions(start, end);
    const nextNumber = String(count + 1).padStart(6, '0');

    return `INV-${dateStr}-${nextNumber}`;
  }

  async getAllTransactions(): Promise<TransactionResponseDto[]> {
    const transactions = await this.transactionRepository.findAll();
    return transactions.map(this.mapToResponse);
  }

  async getTransactionById(id: string): Promise<TransactionResponseDto> {
    const transaction = await this.transactionRepository.findById(id);
    if (!transaction) {
      throw new NotFoundError('Transaction not found');
    }
    return this.mapToResponse(transaction);
  }

  async createTransaction(cashierId: string, dto: CreateTransactionDto): Promise<TransactionResponseDto> {
    // 1. Validate all products in parallel
    const productIds = dto.items.map((item) => item.product_id);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestError('One or more products do not exist');
    }

    const inactiveProduct = products.find((p: any) => !p.is_active);
    if (inactiveProduct) {
      throw new BadRequestError(`Product ${inactiveProduct.name} is inactive`);
    }

    // Map products by ID for fast lookup
    const productMap = new Map<string, any>(products.map((p: any) => [p.id, p]));

    // 2. Calculate totals on server
    let calculatedTotal = 0;
    const itemsData = dto.items.map((item: any) => {
      const product = productMap.get(item.product_id)!;
      const subtotal = product.price * item.qty;
      calculatedTotal += subtotal;

      return {
        product_id: item.product_id,
        qty: item.qty,
        price: product.price,
        subtotal,
      };
    });

    // 3. Check paid amount & change
    let changeAmount = 0;
    if (dto.payment_method === 'CASH') {
      if (dto.paid_amount < calculatedTotal) {
        throw new BadRequestError('Paid amount is less than total price');
      }
      changeAmount = dto.paid_amount - calculatedTotal;
    } else if (dto.payment_method === 'QRIS') {
      // For QRIS, assume paid amount is exactly the total
      dto.paid_amount = calculatedTotal;
      changeAmount = 0;
    }

    // 4. Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber();

    // 5. Save inside database transaction
    const newTx = await this.transactionRepository.create({
      invoice_number: invoiceNumber,
      cashier_id: cashierId,
      payment_method: dto.payment_method,
      total: calculatedTotal,
      paid_amount: dto.paid_amount,
      change_amount: changeAmount,
      items: itemsData,
    });

    return this.mapToResponse(newTx);
  }
}
