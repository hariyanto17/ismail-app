import { AppSetting } from '@prisma/client';
import prisma from '../../config/prisma';

export class SettingCache {
  private static instance: AppSetting | null = null;

  static async load(): Promise<AppSetting> {
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
    this.instance = setting;
    return setting;
  }

  static async get(): Promise<AppSetting> {
    if (!this.instance) {
      return this.load();
    }
    return this.instance;
  }

  static async refresh(): Promise<AppSetting> {
    return this.load();
  }
}

export default SettingCache;
