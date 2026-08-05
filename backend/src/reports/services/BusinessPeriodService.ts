import { SettingCache } from '../cache/SettingCache';
import { getDayRangeInTimezone } from '../../common/timezone';

export class BusinessPeriodService {
  static async getCurrentPeriod(): Promise<{ start: Date; end: Date; startStr: string; endStr: string }> {
    const setting = await SettingCache.get();
    const timezone = setting.timezone;
    const closingDay = setting.closing_day;

    const now = new Date();
    const year = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: timezone, year: 'numeric' }).format(now), 10);
    const month = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: timezone, month: 'numeric' }).format(now), 10);
    const day = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: timezone, day: 'numeric' }).format(now), 10);

    let startYear = year;
    let startMonth = month;
    let endYear = year;
    let endMonth = month;

    if (day <= closingDay) {
      startMonth = month - 1;
      if (startMonth === 0) {
        startMonth = 12;
        startYear = year - 1;
      }
    } else {
      endMonth = month + 1;
      if (endMonth === 13) {
        endMonth = 1;
        endYear = year + 1;
      }
    }

    const startDayNum = closingDay === 31 ? 1 : closingDay + 1;
    const startStr = `${startYear}-${String(startMonth).padStart(2, '0')}-${String(startDayNum).padStart(2, '0')}`;
    const endStr = `${endYear}-${String(endMonth).padStart(2, '0')}-${String(closingDay).padStart(2, '0')}`;

    const { start } = getDayRangeInTimezone(startStr, timezone);
    const { end } = getDayRangeInTimezone(endStr, timezone);

    return { start, end, startStr, endStr };
  }
}
export default BusinessPeriodService;
