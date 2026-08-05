import prisma from '../../config/prisma';
import { getDayRangeInTimezone } from '../../common/timezone';

export class AnalyticsQueryService {
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

  async getDailyAnalytics(dateStr: string) {
    const setting = await this.getSetting();
    const openingTime = setting.opening_time;
    const closingTime = setting.closing_time;

    // 1. Summary Statistics
    const dailyRow = await prisma.analyticsDaily.findUnique({
      where: { business_date: dateStr },
    });

    const totalSales = dailyRow?.total_sales || 0;
    const totalTransactions = dailyRow?.total_transactions || 0;
    const averageTransactionValue = totalTransactions > 0 ? Math.round(totalSales / totalTransactions) : 0;

    const summary = {
      totalSales,
      totalTransactions,
      averageTransactionValue,
      cashSales: dailyRow?.cash_sales || 0,
      qrisSales: dailyRow?.qris_sales || 0,
    };

    // 2. Best / Lowest Selling Products
    const productSales = await prisma.analyticsProductDaily.findMany({
      where: { business_date: dateStr },
    });

    const salesMap = new Map<string, number>();
    productSales.forEach((ps) => {
      salesMap.set(ps.product_id, ps.quantity);
    });

    const activeProducts = await prisma.product.findMany({
      where: { is_active: true },
      select: { id: true, name: true },
    });

    const fullProductSales = activeProducts.map((p) => ({
      product: p.name,
      qty: salesMap.get(p.id) || 0,
    }));

    const topProducts = [...fullProductSales]
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)
      .map((p, idx) => ({
        ranking: idx + 1,
        product: p.product,
        qty: p.qty,
      }));

    const lowProducts = [...fullProductSales]
      .sort((a, b) => a.qty - b.qty)
      .slice(0, 5);

    // 3. Peak Business Hours
    const hourlyRows = await prisma.analyticsHourly.findMany({
      where: { business_date: dateStr },
    });

    const hourlyMap = new Map(hourlyRows.map((h) => [parseInt(h.hour, 10), h]));
    const openingHour = parseInt(openingTime.split(':')[0], 10);
    const closingHour = parseInt(closingTime.split(':')[0], 10);
    const hourlySales = [];

    for (let h = openingHour; h <= closingHour; h++) {
      const data = hourlyMap.get(h);
      hourlySales.push({
        hour: String(h).padStart(2, '0'),
        transactionCount: data?.transaction_count || 0,
        salesAmount: data?.total_sales || 0,
      });
    }

    return {
      summary,
      topProducts,
      lowProducts,
      hourlySales,
    };
  }

  async getMonthlyAnalytics(month: number, year: number) {
    const setting = await this.getSetting();
    const closingDay = setting.closing_day;
    const openingTime = setting.opening_time;
    const closingTime = setting.closing_time;

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

    // 1. Summary Statistics
    const dailyRows = await prisma.analyticsDaily.findMany({
      where: {
        business_date: {
          gte: startPeriodStr,
          lte: endPeriodStr,
        },
      },
    });

    let totalSales = 0;
    let totalTransactions = 0;
    let cashSales = 0;
    let qrisSales = 0;

    dailyRows.forEach((row) => {
      totalSales += row.total_sales;
      totalTransactions += row.total_transactions;
      cashSales += row.cash_sales;
      qrisSales += row.qris_sales;
    });

    const averageTransactionValue = totalTransactions > 0 ? Math.round(totalSales / totalTransactions) : 0;

    const summary = {
      totalSales,
      totalTransactions,
      averageTransactionValue,
      cashSales,
      qrisSales,
    };

    // 2. Best / Lowest Selling Products (Top 10 / Bottom 10)
    const productSalesRows = await prisma.analyticsProductDaily.findMany({
      where: {
        business_date: {
          gte: startPeriodStr,
          lte: endPeriodStr,
        },
      },
    });

    const productSalesMap = new Map<string, number>();
    productSalesRows.forEach((ps) => {
      productSalesMap.set(ps.product_id, (productSalesMap.get(ps.product_id) || 0) + ps.quantity);
    });

    const activeProducts = await prisma.product.findMany({
      where: { is_active: true },
      select: { id: true, name: true },
    });

    const fullProductSales = activeProducts.map((p) => ({
      product: p.name,
      qty: productSalesMap.get(p.id) || 0,
    }));

    const topProducts = [...fullProductSales]
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10)
      .map((p, idx) => ({
        ranking: idx + 1,
        product: p.product,
        qty: p.qty,
      }));

    const lowProducts = [...fullProductSales]
      .sort((a, b) => a.qty - b.qty)
      .slice(0, 10);

    // 3. Peak Business Hours
    const hourlyRows = await prisma.analyticsHourly.findMany({
      where: {
        business_date: {
          gte: startPeriodStr,
          lte: endPeriodStr,
        },
      },
    });

    const hourlyMap = new Map<string, { salesAmount: number; transactionCount: number }>();
    hourlyRows.forEach((row) => {
      const existing = hourlyMap.get(row.hour) || { salesAmount: 0, transactionCount: 0 };
      hourlyMap.set(row.hour, {
        salesAmount: existing.salesAmount + row.total_sales,
        transactionCount: existing.transactionCount + row.transaction_count,
      });
    });

    const openingHour = parseInt(openingTime.split(':')[0], 10);
    const closingHour = parseInt(closingTime.split(':')[0], 10);
    const hourlySales = [];

    for (let h = openingHour; h <= closingHour; h++) {
      const hourStr = String(h).padStart(2, '0');
      const data = hourlyMap.get(hourStr) || { salesAmount: 0, transactionCount: 0 };
      hourlySales.push({
        hour: hourStr,
        transactionCount: data.transactionCount,
        salesAmount: data.salesAmount,
      });
    }

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

export default AnalyticsQueryService;
