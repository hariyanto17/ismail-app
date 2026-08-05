import { SettingCache } from '../cache/SettingCache';
import { getDateStringInTimezone } from '../../common/timezone';

export class BusinessDateService {
  static async getTodayDateString(): Promise<string> {
    const setting = await SettingCache.get();
    const timezone = setting.timezone;
    return getDateStringInTimezone(new Date(), timezone);
  }
}
export default BusinessDateService;
