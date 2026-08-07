import { SettingCache } from '../cache/SettingCache';
import { getDateStringInTimezone } from '../../common/timezone';

export class BusinessDateService {
  static async getTodayDateString(): Promise<string> {
    const setting = await SettingCache.get();
    const timezone = setting.timezone;
    const now = new Date();
    
    const localHour = parseInt(new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    }).format(now), 10);

    const openingHour = parseInt((setting.opening_time || '09:00').split(':')[0], 10);

    if (localHour < openingHour) {
      const yesterday = new Date(now.getTime() - 12 * 60 * 60 * 1000);
      return getDateStringInTimezone(yesterday, timezone);
    }

    return getDateStringInTimezone(now, timezone);
  }
}
export default BusinessDateService;
