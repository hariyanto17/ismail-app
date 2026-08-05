import { performance } from 'perf_hooks';
import prisma from '../../config/prisma';
import { SettingCache } from '../cache/SettingCache';
import { getDayRangeInTimezone, getIsoStringWithOffset } from '../../common/timezone';
import BusinessPeriodService from './BusinessPeriodService';
import BusinessDateService from './BusinessDateService';
import ReportFormatterService from './ReportFormatterService';
import ReportLogService from './ReportLogService';
import WhatsappClient from '../clients/whatsapp';
import { ReportType, ReportStatus } from '@prisma/client';

const whatsappClient = new WhatsappClient();

export class ReportSenderService {
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

  private logConsole(
    recipientName: string,
    recipientPhone: string,
    type: string,
    success: boolean,
    msgId?: string,
    errorMsg?: string,
    latency?: number
  ) {
    console.log('[Report Send Attempt]', {
      recipient: `${recipientName} (${recipientPhone})`,
      reportType: type,
      success,
      messageId: msgId || null,
      errorMessage: errorMsg || null,
      responseTimeMs: latency ? parseFloat(latency.toFixed(2)) : 0,
      timestamp: new Date().toISOString(),
    });
  }

  async sendDaily() {
    const isReady = await whatsappClient.checkStatus();
    if (!isReady) {
      throw new Error('WhatsApp is not connected');
    }

    const setting = await SettingCache.get();
    const timezone = setting.timezone;
    const storeName = setting.store_name;

    const todayStr = await BusinessDateService.getTodayDateString();
    const period = await BusinessPeriodService.getCurrentPeriod();

    const { start, end } = getDayRangeInTimezone(todayStr, timezone);
    const stats = await this.getAggregationData(start, end);

    const recipients = await prisma.reportRecipient.findMany({
      where: {
        is_active: true,
        report_type: { in: ['DAILY', 'ALL'] },
      },
    });

    const reportText = ReportFormatterService.formatDaily({
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

    let successCount = 0;
    let failedCount = 0;

    for (const rec of recipients) {
      const sendStart = performance.now();
      const sendRes = await whatsappClient.sendMessage(rec.phone, reportText);
      const sendEnd = performance.now();
      const latency = sendEnd - sendStart;

      if (sendRes.success) {
        successCount++;
        this.logConsole(rec.name, rec.phone, 'DAILY', true, sendRes.messageId, undefined, latency);
        
        await ReportLogService.createLog({
          reportType: ReportType.DAILY,
          recipient: rec.phone,
          recipientName: rec.name,
          message: reportText,
          status: ReportStatus.SUCCESS,
          sentAt: new Date(),
        });
      } else {
        failedCount++;
        this.logConsole(rec.name, rec.phone, 'DAILY', false, undefined, sendRes.error, latency);

        await ReportLogService.createLog({
          reportType: ReportType.DAILY,
          recipient: rec.phone,
          recipientName: rec.name,
          message: reportText,
          status: ReportStatus.FAILED,
          errorMessage: sendRes.error,
        });
      }
    }

    return {
      success: true,
      totalRecipients: recipients.length,
      successCount,
      failedCount,
    };
  }

  async sendClosing() {
    const isReady = await whatsappClient.checkStatus();
    if (!isReady) {
      throw new Error('WhatsApp is not connected');
    }

    const setting = await SettingCache.get();
    const timezone = setting.timezone;
    const storeName = setting.store_name;

    const period = await BusinessPeriodService.getCurrentPeriod();
    const stats = await this.getAggregationData(period.start, period.end);

    const recipients = await prisma.reportRecipient.findMany({
      where: {
        is_active: true,
        report_type: { in: ['CLOSING', 'ALL'] },
      },
    });

    const reportText = ReportFormatterService.formatClosing({
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

    let successCount = 0;
    let failedCount = 0;

    for (const rec of recipients) {
      const sendStart = performance.now();
      const sendRes = await whatsappClient.sendMessage(rec.phone, reportText);
      const sendEnd = performance.now();
      const latency = sendEnd - sendStart;

      if (sendRes.success) {
        successCount++;
        this.logConsole(rec.name, rec.phone, 'CLOSING', true, sendRes.messageId, undefined, latency);

        await ReportLogService.createLog({
          reportType: ReportType.CLOSING,
          recipient: rec.phone,
          recipientName: rec.name,
          message: reportText,
          status: ReportStatus.SUCCESS,
          sentAt: new Date(),
        });
      } else {
        failedCount++;
        this.logConsole(rec.name, rec.phone, 'CLOSING', false, undefined, sendRes.error, latency);

        await ReportLogService.createLog({
          reportType: ReportType.CLOSING,
          recipient: rec.phone,
          recipientName: rec.name,
          message: reportText,
          status: ReportStatus.FAILED,
          errorMessage: sendRes.error,
        });
      }
    }

    return {
      success: true,
      totalRecipients: recipients.length,
      successCount,
      failedCount,
    };
  }
}

export default ReportSenderService;
