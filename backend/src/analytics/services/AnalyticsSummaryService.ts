import { Prisma } from '@prisma/client';
import { getDateStringInTimezone } from '../../common/timezone';

export class AnalyticsSummaryService {
  static async updateSummary(
    tx: Prisma.TransactionClient,
    transaction: { id: string; created_at: Date; total: number; payment_method: string },
    items: { product_id: string; qty: number; subtotal: number }[]
  ) {
    const setting = await tx.appSetting.findFirst();
    const timezone = setting?.timezone || 'Asia/Makassar';

    const businessDate = getDateStringInTimezone(transaction.created_at, timezone);

    // Save business_date on Transaction itself for easy indexing
    await tx.transaction.update({
      where: { id: transaction.id },
      data: { business_date: businessDate },
    });

    const totalSales = transaction.total;
    const isCash = transaction.payment_method === 'CASH';
    const cashSales = isCash ? totalSales : 0;
    const qrisSales = !isCash ? totalSales : 0;

    // 1. Update AnalyticsDaily
    const dailyRow = await tx.analyticsDaily.findUnique({
      where: { business_date: businessDate },
    });

    if (dailyRow) {
      const newTotalSales = dailyRow.total_sales + totalSales;
      const newTotalTransactions = dailyRow.total_transactions + 1;
      const newAverage = Math.round(newTotalSales / newTotalTransactions);

      await tx.analyticsDaily.update({
        where: { business_date: businessDate },
        data: {
          total_sales: { increment: totalSales },
          total_transactions: { increment: 1 },
          cash_sales: { increment: cashSales },
          qris_sales: { increment: qrisSales },
          average_transaction: newAverage,
        },
      });
    } else {
      await tx.analyticsDaily.create({
        data: {
          business_date: businessDate,
          total_sales: totalSales,
          total_transactions: 1,
          cash_sales: cashSales,
          qris_sales: qrisSales,
          average_transaction: totalSales,
        },
      });
    }

    // 2. Update AnalyticsHourly
    const hourStr = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      hour12: false,
    }).format(transaction.created_at);

    const openingHour = parseInt((setting?.opening_time || '09:00').split(':')[0], 10);
    const closingHour = parseInt((setting?.closing_time || '23:00').split(':')[0], 10);
    const hourVal = parseInt(hourStr, 10);

    if (hourVal >= openingHour && hourVal <= closingHour) {
      await tx.analyticsHourly.upsert({
        where: {
          business_date_hour: {
            business_date: businessDate,
            hour: hourStr,
          },
        },
        update: {
          total_sales: { increment: totalSales },
          transaction_count: { increment: 1 },
        },
        create: {
          business_date: businessDate,
          hour: hourStr,
          total_sales: totalSales,
          transaction_count: 1,
        },
      });
    }

    // 3. Update AnalyticsProductDaily
    for (const item of items) {
      await tx.analyticsProductDaily.upsert({
        where: {
          business_date_product_id: {
            business_date: businessDate,
            product_id: item.product_id,
          },
        },
        update: {
          quantity: { increment: item.qty },
          revenue: { increment: item.subtotal },
        },
        create: {
          business_date: businessDate,
          product_id: item.product_id,
          quantity: item.qty,
          revenue: item.subtotal,
        },
      });
    }
  }
}

export default AnalyticsSummaryService;
