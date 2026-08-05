import prisma from '../config/prisma';
import { SettingCache } from '../reports/cache/SettingCache';

export class AppSettingService {
  async getOrCreate() {
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

  async update(data: {
    store_name?: string;
    store_address?: string;
    store_phone?: string;
    instagram?: string;
    opening_time?: string;
    closing_time?: string;
    closing_day?: number;
    timezone?: string;
    currency?: string;
  }) {
    const setting = await this.getOrCreate();
    const updated = await prisma.appSetting.update({
      where: { id: setting.id },
      data: {
        store_name: data.store_name,
        store_address: data.store_address,
        store_phone: data.store_phone,
        instagram: data.instagram,
        opening_time: data.opening_time,
        closing_time: data.closing_time,
        closing_day: data.closing_day,
        timezone: data.timezone,
        currency: data.currency,
      },
    });
    await SettingCache.refresh();
    return updated;
  }
}
export default AppSettingService;
