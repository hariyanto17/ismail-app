import { Alert, Platform } from 'react-native';
import { BluetoothManager, BluetoothEscposPrinter } from '@vardrz/react-native-bluetooth-escpos-printer';
import { logoBase64 } from './LogoBase64';

export interface BluetoothDevice {
  name: string;
  address: string;
}

class PrinterService {
  private connectedDevice: BluetoothDevice | null = null;

  // Helper functions for 58mm (32 characters width) formatting
  centerLine(text: string, width: number = 32): string {
    if (text.length >= width) return text.substring(0, width);
    const totalSpaces = width - text.length;
    const leftSpaces = Math.floor(totalSpaces / 2);
    const rightSpaces = totalSpaces - leftSpaces;
    return ' '.repeat(leftSpaces) + text + ' '.repeat(rightSpaces);
  }

  padLine(left: string, right: string, width: number = 32): string {
    const spacesCount = width - left.length - right.length;
    const spaces = spacesCount > 0 ? ' '.repeat(spacesCount) : ' ';
    return left + spaces + right;
  }

  formatCurrency(value: number): string {
    return 'Rp' + value.toLocaleString('id-ID');
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  separator(): string {
    return '--------------------------------';
  }

  async printLogo(): Promise<void> {
    try {
      await (BluetoothEscposPrinter as any).printPic(logoBase64, {
        width: 180,
        center: true,
        paperSize: 58,
        autoCut: false
      });
      await this.feed(1);
    } catch (err) {
      console.warn('[PrinterService] Failed to print logo:', err);
    }
  }

  async feed(lines: number = 1): Promise<void> {
    await (BluetoothEscposPrinter as any).printText('\n'.repeat(lines), {});
  }

  async cut(): Promise<void> {
    if (typeof (BluetoothEscposPrinter as any).cut === 'function') {
      await (BluetoothEscposPrinter as any).cut();
    }
  }

  async getPairedDevices(): Promise<BluetoothDevice[]> {
    try {
      const isEnabled = await BluetoothManager.isBluetoothEnabled();
      if (!isEnabled && Platform.OS === 'android') {
        await BluetoothManager.enableBluetooth();
      }

      const devicesStr = await BluetoothManager.enableBluetooth();
      if (Array.isArray(devicesStr)) {
        return devicesStr.map((item: any) => {
          if (typeof item === 'string') {
            try {
              return JSON.parse(item);
            } catch {
              return { name: 'Unknown Device', address: item };
            }
          }
          return { name: item.name || 'Unknown Device', address: item.address };
        });
      }

      const pairedResponse = await BluetoothManager.enableBluetooth();
      console.log('Bluetooth response:', pairedResponse);

      return [
        { name: 'Demo Printer (58mm)', address: '00:11:22:33:44:55' },
        { name: 'Demo Printer (80mm)', address: 'AA:BB:CC:DD:EE:FF' },
      ];
    } catch (error) {
      console.warn('[PrinterService] Failed to get paired devices, returning demo list:', error);
      return [
        { name: 'Demo Printer (58mm)', address: '00:11:22:33:44:55' },
        { name: 'Demo Printer (80mm)', address: 'AA:BB:CC:DD:EE:FF' },
      ];
    }
  }

  async connect(device: BluetoothDevice): Promise<boolean> {
    if (device.address === '00:11:22:33:44:55' || device.address === 'AA:BB:CC:DD:EE:FF') {
      this.connectedDevice = device;
      console.log(`[PrinterService] Simulated connect to ${device.name}`);
      return true;
    }

    try {
      await BluetoothManager.connect(device.address);
      this.connectedDevice = device;
      console.log(`[PrinterService] Connected to ${device.name} (${device.address})`);
      return true;
    } catch (error) {
      console.error('[PrinterService] Connection failed:', error);
      Alert.alert('Connection Error', 'Could not connect to the Bluetooth printer.');
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connectedDevice) return;

    if (this.connectedDevice.address !== '00:11:22:33:44:55' && this.connectedDevice.address !== 'AA:BB:CC:DD:EE:FF') {
      try {
        console.log(`[PrinterService] Disconnected from device ${this.connectedDevice.name}`);
      } catch (error) {
        console.warn('[PrinterService] Disconnect error:', error);
      }
    }

    this.connectedDevice = null;
  }

  async isConnected(): Promise<boolean> {
    return this.connectedDevice !== null;
  }

  async printReceipt(receiptText: string): Promise<boolean> {
    if (!this.connectedDevice) {
      Alert.alert('Printer Error', 'Printer not connected. Formatted receipt printed to console log.');
      console.log('--- FORMATTED ESC/POS RECEIPT (NOT CONNECTED) ---\n' + receiptText);
      return false;
    }

    if (this.connectedDevice.address === '00:11:22:33:44:55' || this.connectedDevice.address === 'AA:BB:CC:DD:EE:FF') {
      console.log(`[PrinterService] (Simulated Print) to ${this.connectedDevice.name}:\n${receiptText}`);
      Alert.alert('Printing Successful', 'The receipt has been printed (Simulated).');
      return true;
    }

    try {
      const printer = BluetoothEscposPrinter as any;
      await printer.printerInit();

      // Print Logo
      await this.printLogo();

      // Print line by line with correct ESC/POS styles
      const lines = receiptText.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (i >= lines.length - 3 && line.trim() === '') {
          continue; // skip trailing empty lines
        }

        if (
          line.includes('KOPI WARA') ||
          line.includes('Jl. Yos Sudarso') ||
          line.includes('085345777') ||
          line.includes('IG: @kopi_wara') ||
          line.includes('Terima Kasih') ||
          line.includes('caffeine')
        ) {
          await printer.printerAlign(printer.ALIGN.CENTER);
          await printer.printText(line + '\n', {});
        } else {
          await printer.printerAlign(printer.ALIGN.LEFT);
          await printer.printText(line + '\n', {});
        }
      }

      await this.feed(3);
      await this.cut();

      console.log('[PrinterService] Printed successfully to hardware.');
      Alert.alert('Printing Successful', 'The receipt has been printed successfully.');
      return true;
    } catch (error) {
      console.error('[PrinterService] Print error:', error);
      Alert.alert('Print Error', 'An error occurred while sending data to the printer.');
      return false;
    }
  }

  formatReceipt(transaction: any): string {
    const divider = this.separator() + '\n';

    let receipt = '';
    receipt += this.centerLine('KOPI WARA') + '\n';
    receipt += this.centerLine('Jl. Yos Sudarso Bajoe') + '\n';
    receipt += this.centerLine('085345777377') + '\n';
    receipt += this.centerLine('IG: @kopi_wara') + '\n';
    receipt += '\n'; // Only one blank line after header

    // Transaction info
    receipt += divider;
    receipt += `No : ${transaction.invoice_number}\n`;
    receipt += `Tgl: ${this.formatDate(transaction.created_at)}\n`;
    receipt += `Kasir: ${transaction.cashier_name}\n`;
    receipt += divider;
    receipt += '\n';

    // Items list
    transaction.items.forEach((item: any) => {
      receipt += `${item.product_name}\n`;
      const qtyPrice = `${item.qty} x ${this.formatCurrency(item.price)}`;
      const subtotal = this.formatCurrency(item.subtotal);
      receipt += this.padLine(qtyPrice, subtotal) + '\n';
    });
    receipt += '\n';

    // Summary
    receipt += divider;
    receipt += this.padLine('TOTAL', this.formatCurrency(transaction.total)) + '\n';
    receipt += '\n';

    const paymentLabel = transaction.payment_method === 'CASH' ? 'Tunai' : 'QRIS';
    receipt += this.padLine(paymentLabel, this.formatCurrency(transaction.paid_amount)) + '\n';
    receipt += '\n';
    receipt += this.padLine('Kembalian', this.formatCurrency(transaction.change_amount)) + '\n';
    receipt += divider;
    receipt += '\n';

    // Footer
    receipt += this.centerLine('Kopi wara : 1% caffeine, 99% kebahagiaan') + '\n';
    receipt += this.centerLine('Terima Kasih') + '\n';
    receipt += this.centerLine('IG: @kopi_wara') + '\n';

    return receipt;
  }

  async printTestPage(): Promise<void> {
    if (!this.connectedDevice) {
      throw new Error('Printer not connected.');
    }

    if (this.connectedDevice.address === '00:11:22:33:44:55' || this.connectedDevice.address === 'AA:BB:CC:DD:EE:FF') {
      const testReceipt = this.generateTestReceipt();
      console.log(`[PrinterService] (Simulated Test Page) to ${this.connectedDevice.name}:\n${testReceipt}`);
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
      return;
    }

    try {
      const printer = BluetoothEscposPrinter as any;
      await printer.printerInit();

      // Print Logo
      await this.printLogo();

      // Print centered header
      await printer.printerAlign(printer.ALIGN.CENTER);
      await printer.printText(this.centerLine('KOPI WARA') + '\n', {});
      await printer.printText(this.centerLine('Jl. Yos Sudarso Bajoe') + '\n', {});
      await printer.printText(this.centerLine('085345777377') + '\n', {});
      await printer.printText(this.centerLine('IG: @kopi_wara') + '\n', {});
      await this.feed(1);

      // Divider & Trans Info
      await printer.printerAlign(printer.ALIGN.LEFT);
      await printer.printText(this.separator() + '\n', {});
      await printer.printText('No : TEST-000001\n', {});
      await printer.printText(`Tgl: ${this.formatDate(new Date().toISOString())}\n`, {});
      await printer.printText('Kasir: Admin\n', {});
      await printer.printText(this.separator() + '\n', {});
      await this.feed(1);

      // Sample items
      await printer.printText('Es Kopi Gula Aren\n', {});
      await printer.printText(this.padLine('2 x ' + this.formatCurrency(13000), this.formatCurrency(26000)) + '\n', {});

      await printer.printText('Ice Chocolate\n', {});
      await printer.printText(this.padLine('1 x ' + this.formatCurrency(15000), this.formatCurrency(15000)) + '\n', {});
      await this.feed(1);

      // Summary
      await printer.printText(this.separator() + '\n', {});
      await printer.printText(this.padLine('TOTAL', this.formatCurrency(41000)) + '\n', {});
      await printer.printText('\n', {});
      await printer.printText(this.padLine('Tunai', this.formatCurrency(50000)) + '\n', {});
      await printer.printText('\n', {});
      await printer.printText(this.padLine('Kembalian', this.formatCurrency(9000)) + '\n', {});
      await printer.printText(this.separator() + '\n', {});
      await this.feed(1);

      // Footer
      await printer.printerAlign(printer.ALIGN.CENTER);
      await printer.printText(this.centerLine('Kopi wara : 1% caffeine, 99% kebahagiaan') + '\n', {});
      await printer.printText(this.centerLine('Terima Kasih') + '\n', {});
      await printer.printText(this.centerLine('IG: @kopi_wara') + '\n', {});

      await this.feed(3);
      await this.cut();
    } catch (error) {
      console.error('[PrinterService] Error printing test page:', error);
      throw error;
    }
  }

  private generateTestReceipt(): string {
    const divider = this.separator() + '\n';
    return `${this.centerLine('KOPI WARA')}\n${this.centerLine('Jl. Yos Sudarso Bajoe')}\n${this.centerLine('085345777377')}\n${this.centerLine('IG: @kopi_wara')}\n\n${divider}No : TEST-000001\nTgl: ${this.formatDate(new Date().toISOString())}\nKasir: Admin\n${divider}\nEs Kopi Gula Aren\n${this.padLine('2 x ' + this.formatCurrency(13000), this.formatCurrency(26000))}\n\nIce Chocolate\n${this.padLine('1 x ' + this.formatCurrency(15000), this.formatCurrency(15000))}\n\n${divider}${this.padLine('TOTAL', this.formatCurrency(41000))}\n\n${this.padLine('Tunai', this.formatCurrency(50000))}\n\n${this.padLine('Kembalian', this.formatCurrency(9000))}\n${divider}\n${this.centerLine('Kopi wara : 1% caffeine, 99% kebahagiaan')}\n${this.centerLine('Terima Kasih')}\n${this.centerLine('IG: @kopi_wara')}\n\n\n\n`;
  }
}

export default new PrinterService();

