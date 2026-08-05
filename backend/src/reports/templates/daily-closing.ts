export interface DailyReportData {
  storeName: string;
  dateStr: string;
  periodStr: string;
  totalTransactions: number;
  cashSales: number;
  qrisSales: number;
  totalSales: number;
  topProducts: Array<{ name: string; qty: number }>;
}

export class DailyReportTemplate {
  static build(data: DailyReportData): string {
    const formatCurrency = (val: number) => 'Rp ' + val.toLocaleString('id-ID');

    let productsText = '';
    data.topProducts.forEach((p, idx) => {
      productsText += `${idx + 1}.\n${p.name}\n${p.qty}\n\n`;
    });
    if (!productsText) {
      productsText = 'Tidak ada penjualan produk.\n\n';
    }

    return `📊 DAILY SALES REPORT

${data.storeName.toUpperCase()}

Tanggal
${data.dateStr}

Periode Bisnis
${data.periodStr}

--------------------------------

Total Transaksi

${data.totalTransactions}

Cash

${formatCurrency(data.cashSales)}

QRIS

${formatCurrency(data.qrisSales)}

Total Penjualan

${formatCurrency(data.totalSales)}

--------------------------------

Produk Terlaris (Top 5)

${productsText.trim()}

--------------------------------

Generated Automatically

Thank you.`;
  }
}

export interface ClosingReportData {
  storeName: string;
  periodStr: string;
  openingDate: string;
  closingDate: string;
  totalTransactions: number;
  cashSales: number;
  qrisSales: number;
  totalSales: number;
  topProducts: Array<{ name: string; qty: number }>;
  generatedTime: string;
}

export class ClosingReportTemplate {
  static build(data: ClosingReportData): string {
    const formatCurrency = (val: number) => 'Rp ' + val.toLocaleString('id-ID');

    let productsText = '';
    data.topProducts.forEach((p, idx) => {
      productsText += `${idx + 1}.\n${p.name}\n${p.qty}\n\n`;
    });
    if (!productsText) {
      productsText = 'Tidak ada penjualan produk.\n\n';
    }

    return `📊 CLOSING SALES REPORT

${data.storeName.toUpperCase()}

Periode Bisnis
${data.periodStr}

Tanggal Pembukaan
${data.openingDate}

Tanggal Penutupan
${data.closingDate}

--------------------------------

Total Transaksi

${data.totalTransactions}

Cash

${formatCurrency(data.cashSales)}

QRIS

${formatCurrency(data.qrisSales)}

Total Penjualan

${formatCurrency(data.totalSales)}

--------------------------------

Produk Terlaris (Top 5)

${productsText.trim()}

--------------------------------

Waktu Dibuat
${data.generatedTime}

Generated Automatically

Thank you.`;
  }
}
