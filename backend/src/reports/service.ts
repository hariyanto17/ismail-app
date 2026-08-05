import prisma from '../config/prisma';
import { getDayRangeInTimezone } from '../common/timezone';

export class ReportService {
  async getDailyReport(dateStr: string) {
    const setting = await prisma.appSetting.findFirst();
    const timezone = setting?.timezone || 'Asia/Makassar';
    const { start, end } = getDayRangeInTimezone(dateStr, timezone);

    const transactions = await prisma.transaction.findMany({
      where: {
        created_at: {
          gte: start,
          lte: end,
        },
      },
      include: {
        cashier: true,
        items: {
          include: { product: true },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    const totalTransactions = transactions.length;
    let totalSales = 0;
    let cashSales = 0;
    let qrisSales = 0;

    const mappedTransactions = transactions.map((tx) => {
      totalSales += tx.total;
      if (tx.payment_method === 'CASH') {
        cashSales += tx.total;
      } else if (tx.payment_method === 'QRIS') {
        qrisSales += tx.total;
      }

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
        items: tx.items.map((item) => ({
          id: item.id,
          product_name: item.product.name,
          qty: item.qty,
          price: item.price,
          subtotal: item.subtotal,
        })),
      };
    });

    return {
      date: dateStr,
      totalTransactions,
      totalSales,
      cashSales,
      qrisSales,
      transactions: mappedTransactions,
    };
  }
}

export default ReportService;
