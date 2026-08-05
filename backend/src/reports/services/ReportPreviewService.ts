import prisma from '../../config/prisma';
import { SettingCache } from '../cache/SettingCache';
import { getDayRangeInTimezone, getIsoStringWithOffset } from '../../common/timezone';
import BusinessPeriodService from './BusinessPeriodService';
import BusinessDateService from './BusinessDateService';
import ReportFormatterService from './ReportFormatterService';

export class ReportPreviewService {
  private async getAggregationData(start: Date, end: Date) {
    const transactions = await prisma.transaction.findMany({
      where: {
        created_at: {
          gte: start,
          lte: end,
        },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    const totalTransactions = transactions.length;
    let totalSales = 0;
    let cashSales = 0;
    let qrisSales = 0;

    const productMap = new Map<string, { name: string; qty: number }>();

    transactions.forEach((tx) => {
      totalSales += tx.total;
      if (tx.payment_method === 'CASH') {
        cashSales += tx.total;
      } else if (tx.payment_method === 'QRIS') {
        qrisSales += tx.total;
      }

      tx.items.forEach((item) => {
        const prod = item.product;
        const current = productMap.get(prod.id) || { name: prod.name, qty: 0 };
        current.qty += item.qty;
        productMap.set(prod.id, current);
      });
    });

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return {
      totalTransactions,
      totalSales,
      cashSales,
      qrisSales,
      topProducts,
    };
  }

  async previewDaily() {
    const setting = await SettingCache.get();
    const timezone = setting.timezone;
    const storeName = setting.store_name;

    const todayStr = await BusinessDateService.getTodayDateString();
    const period = await BusinessPeriodService.getCurrentPeriod();

    const { start, end } = getDayRangeInTimezone(todayStr, timezone);
    const stats = await this.getAggregationData(start, end);

    return ReportFormatterService.formatDaily({
      storeName,
      todayStr,
      startStr: period.startStr,
      endStr: period.endStr,
      totalTransactions: stats.totalTransactions,
      cashSales: stats.cashSales,
      qrisSales: stats.qrisSales,
      totalSales: stats.totalSales,
      topProducts: stats.topProducts,
    });
  }

  async previewClosing() {
    const setting = await SettingCache.get();
    const timezone = setting.timezone;
    const storeName = setting.store_name;

    const period = await BusinessPeriodService.getCurrentPeriod();
    const stats = await this.getAggregationData(period.start, period.end);

    return ReportFormatterService.formatClosing({
      storeName,
      startStr: period.startStr,
      endStr: period.endStr,
      totalTransactions: stats.totalTransactions,
      cashSales: stats.cashSales,
      qrisSales: stats.qrisSales,
      totalSales: stats.totalSales,
      topProducts: stats.topProducts,
      generatedTime: getIsoStringWithOffset(new Date(), timezone),
    });
  }
}

export default ReportPreviewService;
