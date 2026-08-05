// Formatting helper functions
const centerLine = (text: string, width: number = 32): string => {
  if (text.length >= width) return text.substring(0, width);
  const totalSpaces = width - text.length;
  const leftSpaces = Math.floor(totalSpaces / 2);
  const rightSpaces = totalSpaces - leftSpaces;
  return ' '.repeat(leftSpaces) + text + ' '.repeat(rightSpaces);
};

const padLine = (left: string, right: string, width: number = 32): string => {
  const spacesCount = width - left.length - right.length;
  const spaces = spacesCount > 0 ? ' '.repeat(spacesCount) : ' ';
  return left + spaces + right;
};

const formatCurrency = (value: number): string => {
  return 'Rp' + value.toLocaleString('id-ID');
};

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const separator = (): string => {
  return '--------------------------------';
};

export const BrandReceipt = {
  build(transaction: any, branding: any): string {
    const divider = separator() + '\n';

    let receipt = '';
    receipt += centerLine(branding.receipt.header) + '\n';
    receipt += centerLine(branding.business.address) + '\n';
    receipt += centerLine(branding.business.phone) + '\n';
    receipt += centerLine(branding.business.instagram) + '\n';
    receipt += '\n'; // Only one blank line after header

    // Transaction info
    receipt += divider;
    receipt += `No : ${transaction.invoice_number}\n`;
    receipt += `Tgl: ${formatDate(transaction.created_at)}\n`;
    receipt += `Kasir: ${transaction.cashier_name}\n`;
    receipt += divider;
    receipt += '\n';

    // Items list
    transaction.items.forEach((item: any) => {
      receipt += `${item.product_name}\n`;
      const qtyPrice = `${item.qty} x ${formatCurrency(item.price)}`;
      const subtotal = formatCurrency(item.subtotal);
      receipt += padLine(qtyPrice, subtotal) + '\n';
    });
    receipt += '\n';

    // Summary
    receipt += divider;
    receipt += padLine('TOTAL', formatCurrency(transaction.total)) + '\n';
    receipt += '\n';

    const paymentLabel = transaction.payment_method === 'CASH' ? 'Tunai' : 'QRIS';
    receipt += padLine(paymentLabel, formatCurrency(transaction.paid_amount)) + '\n';
    receipt += '\n';
    receipt += padLine('Kembalian', formatCurrency(transaction.change_amount)) + '\n';
    receipt += divider;
    receipt += '\n';

    // Footer
    receipt += centerLine(branding.receipt.footerName) + '\n';
    receipt += centerLine(branding.receipt.footerTagline) + '\n';
    receipt += centerLine(branding.receipt.footerThankYou) + '\n';
    receipt += centerLine(branding.business.instagram) + '\n';

    return receipt;
  },

  testReceipt(branding: any): string {
    const divider = separator() + '\n';
    return `${centerLine(branding.receipt.header)}\n${centerLine(branding.business.address)}\n${centerLine(branding.business.phone)}\n${centerLine(branding.business.instagram)}\n\n${divider}No : TEST-000001\nTgl: ${formatDate(new Date().toISOString())}\nKasir: Admin\n${divider}\nEs Kopi Gula Aren\n${padLine('2 x ' + formatCurrency(13000), formatCurrency(26000))}\n\nIce Chocolate\n${padLine('1 x ' + formatCurrency(15000), formatCurrency(15000))}\n\n${divider}${padLine('TOTAL', formatCurrency(41000))}\n\n${padLine('Tunai', formatCurrency(50000))}\n\n${padLine('Kembalian', formatCurrency(9000))}\n${divider}\n${centerLine(branding.receipt.footerName)}\n${centerLine(branding.receipt.footerTagline)}\n${centerLine(branding.receipt.footerThankYou)}\n${centerLine(branding.business.instagram)}\n\n\n\n`;
  },

  isCenterLine(line: string, branding: any): boolean {
    const trimmed = line.trim();
    if (!trimmed) return false;
    return (
      trimmed.includes(branding.receipt.header) ||
      trimmed.includes(branding.business.address) ||
      trimmed.includes(branding.business.phone) ||
      trimmed.includes(branding.business.instagram) ||
      trimmed.includes(branding.receipt.footerName) ||
      trimmed.includes(branding.receipt.footerTagline) ||
      trimmed.includes(branding.receipt.footerThankYou)
    );
  }
};

export default BrandReceipt;
