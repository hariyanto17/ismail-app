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

  async getAnalytics(dateStr: string) {
    const setting = await prisma.appSetting.findFirst();
    const timezone = setting?.timezone || 'Asia/Makassar';
    const { start, end } = getDayRangeInTimezone(dateStr, timezone);

    // 1. Summary
    const summaryAggregate = await prisma.transaction.aggregate({
      where: {
        created_at: {
          gte: start,
          lte: end,
        },
      },
      _count: { id: true },
      _sum: { total: true },
      _avg: { total: true },
    });

    const summary = {
      transactions: summaryAggregate._count.id || 0,
      revenue: summaryAggregate._sum.total || 0,
      averageTransaction: Math.round(summaryAggregate._avg.total || 0),
    };

    // 2. Payments Composition
    const paymentsGroup = await prisma.transaction.groupBy({
      by: ['payment_method'],
      where: {
        created_at: {
          gte: start,
          lte: end,
        },
      },
      _sum: { total: true },
    });

    const payments = {
      cash: 0,
      qris: 0,
    };

    paymentsGroup.forEach((group) => {
      if (group.payment_method === 'CASH') {
        payments.cash = group._sum.total || 0;
      } else if (group.payment_method === 'QRIS') {
        payments.qris = group._sum.total || 0;
      }
    });

    // 3 & 4. Top and Slow Moving Products
    const itemsGroup = await prisma.transactionItem.groupBy({
      by: ['product_id'],
      where: {
        transaction: {
          created_at: {
            gte: start,
            lte: end,
          },
        },
      },
      _sum: { qty: true },
    });

    const productIds = itemsGroup.map((item) => item.product_id);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p.name]));

    const mappedSales = itemsGroup.map((item) => ({
      product: productMap.get(item.product_id) || 'Unknown Product',
      qty: item._sum.qty || 0,
    }));

    const sortedDesc = [...mappedSales].sort((a, b) => b.qty - a.qty);
    const topProducts = sortedDesc.slice(0, 5).map((p, idx) => ({
      ranking: idx + 1,
      product: p.product,
      qty: p.qty,
    }));

    const slowProducts = [...mappedSales]
      .filter((p) => p.qty > 0)
      .sort((a, b) => a.qty - b.qty)
      .slice(0, 5);

    // 5. Hourly Sales Analysis using raw SQL to group by hour in target timezone
    const hourlyData: { hour: number; count: number; amount: number }[] = await prisma.$queryRaw`
      SELECT 
        EXTRACT(HOUR FROM created_at AT TIME ZONE 'UTC' AT TIME ZONE ${timezone})::int as hour,
        COUNT(id)::int as count,
        COALESCE(SUM(total), 0)::float as amount
      FROM "transactions"
      WHERE created_at >= ${start} AND created_at <= ${end}
      GROUP BY hour
      ORDER BY hour
    `;

    const openingHour = parseInt((setting?.opening_time || '09:00').split(':')[0], 10);
    const closingHour = parseInt((setting?.closing_time || '23:00').split(':')[0], 10);

    const hourlySalesMap = new Map(hourlyData.map((d) => [d.hour, d]));

    const hourlySales = [];
    for (let h = openingHour; h <= closingHour; h++) {
      const data = hourlySalesMap.get(h);
      hourlySales.push({
        hour: String(h).padStart(2, '0'),
        transactionCount: data?.count || 0,
        salesAmount: data?.amount || 0,
      });
    }

    return {
      summary,
      payments,
      topProducts,
      lowProducts: slowProducts,
      hourlySales,
    };
  }
}

export default ReportService;
