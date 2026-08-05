import { DailyReportTemplate, ClosingReportTemplate } from '../templates/daily-closing';

export class ReportFormatterService {
  private static formatDateIndo(dateStr: string): string {
    const [y, m, d] = dateStr.split('-');
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const monthName = months[parseInt(m, 10) - 1] || m;
    return `${parseInt(d, 10)} ${monthName} ${y}`;
  }

  private static formatRangeIndo(startStr: string, endStr: string): string {
    return `${this.formatDateIndo(startStr)} - ${this.formatDateIndo(endStr)}`;
  }

  static formatDaily(data: {
    storeName: string;
    todayStr: string;
    startStr: string;
    endStr: string;
    totalTransactions: number;
    cashSales: number;
    qrisSales: number;
    totalSales: number;
    topProducts: Array<{ name: string; qty: number }>;
  }): string {
    return DailyReportTemplate.build({
      storeName: data.storeName,
      dateStr: this.formatDateIndo(data.todayStr),
      periodStr: this.formatRangeIndo(data.startStr, data.endStr),
      totalTransactions: data.totalTransactions,
      cashSales: data.cashSales,
      qrisSales: data.qrisSales,
      totalSales: data.totalSales,
      topProducts: data.topProducts,
    });
  }

  static formatClosing(data: {
    storeName: string;
    startStr: string;
    endStr: string;
    totalTransactions: number;
    cashSales: number;
    qrisSales: number;
    totalSales: number;
    topProducts: Array<{ name: string; qty: number }>;
    generatedTime: string;
  }): string {
    return ClosingReportTemplate.build({
      storeName: data.storeName,
      periodStr: this.formatRangeIndo(data.startStr, data.endStr),
      openingDate: this.formatDateIndo(data.startStr),
      closingDate: this.formatDateIndo(data.endStr),
      totalTransactions: data.totalTransactions,
      cashSales: data.cashSales,
      qrisSales: data.qrisSales,
      totalSales: data.totalSales,
      topProducts: data.topProducts,
      generatedTime: data.generatedTime,
    });
  }
}

export default ReportFormatterService;
