import prisma from '../config/prisma';
import { getDayRangeInTimezone } from '../common/timezone';

export class AnalyticsService {
  private async getSetting() {
    let setting = await prisma.appSetting.findFirst();
    if (!setting) {
      setting = await prisma.appSetting.create({
        data: {
          store_name: 'Kopi Wara',
          store_address: '',
          store_phone: '',
          instagram: '',
          opening_time: '09:00',
          closing_time: '23:00',
          closing_day: 25,
          timezone: 'Asia/Makassar',
          currency: 'IDR',
        },
      });
    }
    return setting;
  }

  private async getProductSales(start: Date, end: Date) {
    const activeProducts = await prisma.product.findMany({
      where: { is_active: true },
      select: { id: true, name: true },
    });

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

    const salesMap = new Map<string, number>();
    itemsGroup.forEach((item) => {
      salesMap.set(item.product_id, item._sum.qty || 0);
    });

    return activeProducts.map((p) => ({
      product: p.name,
      qty: salesMap.get(p.id) || 0,
    }));
  }

  private async getHourlySalesData(start: Date, end: Date, timezone: string, openingTime: string, closingTime: string) {
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

    const openingHour = parseInt(openingTime.split(':')[0], 10);
    const closingHour = parseInt(closingTime.split(':')[0], 10);

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

    return hourlySales;
  }

  async getDailyAnalytics(dateStr: string) {
    const setting = await this.getSetting();
    const timezone = setting.timezone;
    const { start, end } = getDayRangeInTimezone(dateStr, timezone);

    // 1. Summary Statistics
    const transactions = await prisma.transaction.findMany({
      where: {
        created_at: {
          gte: start,
          lte: end,
        },
      },
      select: {
        total: true,
        payment_method: true,
      },
    });

    const totalTransactions = transactions.length;
    let totalSales = 0;
    let cashSales = 0;
    let qrisSales = 0;

    transactions.forEach((tx) => {
      totalSales += tx.total;
      if (tx.payment_method === 'CASH') {
        cashSales += tx.total;
      } else if (tx.payment_method === 'QRIS') {
        qrisSales += tx.total;
      }
    });

    const averageTransactionValue = totalTransactions > 0 ? Math.round(totalSales / totalTransactions) : 0;

    const summary = {
      totalSales,
      totalTransactions,
      averageTransactionValue,
      cashSales,
      qrisSales,
    };

    // 2. Best / Lowest Selling Products
    const productSales = await this.getProductSales(start, end);

    const topProducts = [...productSales]
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)
      .map((p, idx) => ({
        ranking: idx + 1,
        product: p.product,
        qty: p.qty,
      }));

    const lowProducts = [...productSales]
      .sort((a, b) => a.qty - b.qty)
      .slice(0, 5);

    // 3. Peak Business Hours
    const hourlySales = await this.getHourlySalesData(
      start,
      end,
      timezone,
      setting.opening_time,
      setting.closing_time
    );

    return {
      summary,
      topProducts,
      lowProducts,
      hourlySales,
    };
  }

  async getMonthlyAnalytics(month: number, year: number) {
    const setting = await this.getSetting();
    const timezone = setting.timezone;
    const closingDay = setting.closing_day;

    let startYear = year;
    let startMonth = month - 1;
    let endYear = year;
    let endMonth = month;

    if (startMonth === 0) {
      startMonth = 12;
      startYear = year - 1;
    }

    const startDayNum = closingDay === 31 ? 1 : closingDay + 1;
    const startPeriodStr = `${startYear}-${String(startMonth).padStart(2, '0')}-${String(startDayNum).padStart(2, '0')}`;
    const endPeriodStr = `${endYear}-${String(endMonth).padStart(2, '0')}-${String(closingDay).padStart(2, '0')}`;

    const { start } = getDayRangeInTimezone(startPeriodStr, timezone);
    const { end } = getDayRangeInTimezone(endPeriodStr, timezone);

    // 1. Summary Statistics
    const transactions = await prisma.transaction.findMany({
      where: {
        created_at: {
          gte: start,
          lte: end,
        },
      },
      select: {
        total: true,
        payment_method: true,
      },
    });

    const totalTransactions = transactions.length;
    let totalSales = 0;
    let cashSales = 0;
    let qrisSales = 0;

    transactions.forEach((tx) => {
      totalSales += tx.total;
      if (tx.payment_method === 'CASH') {
        cashSales += tx.total;
      } else if (tx.payment_method === 'QRIS') {
        qrisSales += tx.total;
      }
    });

    const averageTransactionValue = totalTransactions > 0 ? Math.round(totalSales / totalTransactions) : 0;

    const summary = {
      totalSales,
      totalTransactions,
      averageTransactionValue,
      cashSales,
      qrisSales,
    };

    // 2. Best / Lowest Selling Products (Top 10 / Bottom 10 for Monthly)
    const productSales = await this.getProductSales(start, end);

    const topProducts = [...productSales]
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10)
      .map((p, idx) => ({
        ranking: idx + 1,
        product: p.product,
        qty: p.qty,
      }));

    const lowProducts = [...productSales]
      .sort((a, b) => a.qty - b.qty)
      .slice(0, 10);

    // 3. Peak Business Hours
    const hourlySales = await this.getHourlySalesData(
      start,
      end,
      timezone,
      setting.opening_time,
      setting.closing_time
    );

    return {
      businessPeriod: {
        startStr: startPeriodStr,
        endStr: endPeriodStr,
      },
      summary,
      topProducts,
      lowProducts,
      hourlySales,
    };
  }
}

export default AnalyticsService;
