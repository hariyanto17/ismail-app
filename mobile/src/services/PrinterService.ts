import { Platform } from 'react-native';
import { showGlobalConfirmation } from '../components/ConfirmationProvider';
import { BluetoothManager, BluetoothEscposPrinter } from '@vardrz/react-native-bluetooth-escpos-printer';
import Branding from '../branding';

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
      await (BluetoothEscposPrinter as any).printPic(Branding.assets.logoBase64, {
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
      showGlobalConfirmation({
        title: 'Kesalahan Koneksi',
        message: 'Tidak dapat terhubung ke printer Bluetooth.',
        confirmText: 'OK',
        variant: 'danger',
      });
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
      showGlobalConfirmation({
        title: 'Kesalahan Printer',
        message: 'Printer tidak terhubung. Struk tercetak di log konsol.',
        confirmText: 'OK',
        variant: 'warning',
      });
      console.log('--- FORMATTED ESC/POS RECEIPT (NOT CONNECTED) ---\n' + receiptText);
      return false;
    }

    if (this.connectedDevice.address === '00:11:22:33:44:55' || this.connectedDevice.address === 'AA:BB:CC:DD:EE:FF') {
      console.log(`[PrinterService] (Simulated Print) to ${this.connectedDevice.name}:\n${receiptText}`);
      showGlobalConfirmation({
        title: 'Pencetakan Sukses',
        message: 'Struk berhasil dicetak (Simulasi).',
        confirmText: 'OK',
        variant: 'success',
      });
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

        if (Branding.receipt.isCenterLine(line)) {
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
      showGlobalConfirmation({
        title: 'Pencetakan Sukses',
        message: 'Struk berhasil dicetak ke hardware.',
        confirmText: 'OK',
        variant: 'success',
      });
      return true;
    } catch (error) {
      console.error('[PrinterService] Print error:', error);
      showGlobalConfirmation({
        title: 'Kesalahan Cetak',
        message: 'Terjadi kesalahan saat mengirim data ke printer.',
        confirmText: 'OK',
        variant: 'danger',
      });
      return false;
    }
  }

  formatReceipt(transaction: any): string {
    return Branding.receipt.build(transaction);
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
      const testReceipt = this.generateTestReceipt();
      const lines = testReceipt.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (i >= lines.length - 3 && line.trim() === '') {
          continue; // skip trailing empty lines
        }
        if (Branding.receipt.isCenterLine(line)) {
          await printer.printerAlign(printer.ALIGN.CENTER);
          await printer.printText(line + '\n', {});
        } else {
          await printer.printerAlign(printer.ALIGN.LEFT);
          await printer.printText(line + '\n', {});
        }
      }

      await this.feed(3);
      await this.cut();
    } catch (error) {
      console.error('[PrinterService] Error printing test page:', error);
      throw error;
    }
  }

  private generateTestReceipt(): string {
    return Branding.receipt.testReceipt();
  }
}

export default new PrinterService();
