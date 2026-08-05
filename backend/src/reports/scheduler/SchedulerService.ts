import prisma from '../../config/prisma';
import { SettingCache } from '../cache/SettingCache';
import { getDateStringInTimezone, getDayRangeInTimezone } from '../../common/timezone';
import WhatsappClient from '../clients/whatsapp';
import ReportSenderService from '../services/ReportSenderService';
import ReportLogService from '../services/ReportLogService';
import { ReportType, ReportStatus } from '@prisma/client';

export class SchedulerService {
  private static instance: SchedulerService | null = null;

  static getInstance(): SchedulerService {
    if (!SchedulerService.instance) {
      SchedulerService.instance = new SchedulerService();
    }
    return SchedulerService.instance;
  }

  private isRunning: boolean = false;
  private intervalHandle?: ReturnType<typeof setInterval>;
  private reportSender = new ReportSenderService();
  private whatsappClient = new WhatsappClient();

  async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('[Scheduler Infrastructure] Started. Ready to compute background reporting schedules.');

    await SettingCache.load();
    await this.checkSchedules();

    this.intervalHandle = setInterval(() => {
      this.checkSchedules().catch((error) => {
        console.error('[Scheduler Infrastructure] Error during scheduled check:', error);
      });
    }, 60 * 1000);
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = undefined;
    }
    console.log('[Scheduler Infrastructure] Stopped.');
  }

  async reload(): Promise<void> {
    console.log('[Scheduler Infrastructure] Reloading background reporting configurations...');
    await this.stop();
    await SettingCache.refresh();
    await this.start();
  }

  private getLocalDateTimeParts(timezone: string) {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(now);

    const map = new Map(parts.map((part) => [part.type, part.value]));
    return {
      year: parseInt(map.get('year') || '0', 10),
      month: parseInt(map.get('month') || '0', 10),
      day: parseInt(map.get('day') || '0', 10),
      hour: parseInt(map.get('hour') || '0', 10),
      minute: parseInt(map.get('minute') || '0', 10),
      second: parseInt(map.get('second') || '0', 10),
    };
  }

  private async hasDailyLog(timezone: string) {
    const todayStr = getDateStringInTimezone(new Date(), timezone);
    const { start, end } = getDayRangeInTimezone(todayStr, timezone);
    return prisma.reportLog.findFirst({
      where: {
        report_type: ReportType.DAILY,
        created_at: {
          gte: start,
          lte: end,
        },
      },
    });
  }

  private async hasClosingLog(timezone: string) {
    const local = this.getLocalDateTimeParts(timezone);
    const monthKey = String(local.month).padStart(2, '0');
    const startMonth = getDayRangeInTimezone(`${local.year}-${monthKey}-01`, timezone).start;
    const lastDayOfMonth = new Date(Date.UTC(local.year, local.month, 0)).getUTCDate();
    const endMonth = getDayRangeInTimezone(`${local.year}-${monthKey}-${String(lastDayOfMonth).padStart(2, '0')}`, timezone).end;

    return prisma.reportLog.findFirst({
      where: {
        report_type: ReportType.CLOSING,
        created_at: {
          gte: startMonth,
          lte: endMonth,
        },
      },
    });
  }

  private async createFailedLog(reportType: ReportType, reason: string) {
    await ReportLogService.createLog({
      reportType,
      recipient: 'scheduler',
      recipientName: 'Scheduler',
      message: reason,
      status: ReportStatus.FAILED,
      sentAt: new Date(),
    });
  }

  private async checkSchedules(): Promise<void> {
    if (!this.isRunning) return;

    const setting = await SettingCache.get();
    if (!setting) {
      console.warn('[Scheduler Infrastructure] No settings available for scheduled checks.');
      return;
    }

    const timezone = setting.timezone || 'Asia/Makassar';
    const local = this.getLocalDateTimeParts(timezone);
    const [closingHourStr, closingMinuteStr] = (setting.closing_time || '23:00').split(':');
    const closingHour = parseInt(closingHourStr, 10);
    const closingMinute = parseInt(closingMinuteStr, 10);
    const dailyTriggerHour = (closingHour + 1) % 24;
    const dailyTriggerMinute = closingMinute;
    const isDailyTrigger = local.hour === dailyTriggerHour && local.minute === dailyTriggerMinute;

    const prevMonthDays = new Date(Date.UTC(local.year, local.month, 0)).getUTCDate();
    const isNextDayAfterClosing = local.day === setting.closing_day + 1;
    const isFirstDayAfterLastDayClose = local.day === 1 && setting.closing_day >= prevMonthDays;
    const isClosingTrigger = local.hour === closingHour && local.minute === closingMinute && (isNextDayAfterClosing || isFirstDayAfterLastDayClose);

    if (isDailyTrigger) {
      await this.handleDailyTrigger(setting, timezone);
    }

    if (isClosingTrigger) {
      await this.handleClosingTrigger(setting, timezone);
    }
  }

  private async handleDailyTrigger(setting: any, timezone: string) {
    const missingFields = [];
    if (!setting.opening_time) missingFields.push('opening_time');
    if (!setting.closing_time) missingFields.push('closing_time');
    if (setting.closing_day == null) missingFields.push('closing_day');

    if (missingFields.length > 0) {
      await this.createFailedLog(ReportType.DAILY, `Daily report skipped because missing settings: ${missingFields.join(', ')}`);
      return;
    }

    const recipientCount = await prisma.reportRecipient.count({
      where: {
        is_active: true,
        report_type: { in: ['DAILY', 'ALL'] },
      },
    });

    if (recipientCount === 0) {
      await this.createFailedLog(ReportType.DAILY, 'Daily report skipped because no active recipients exist.');
      return;
    }

    const whatsappReady = await this.whatsappClient.checkStatus();
    if (!whatsappReady) {
      await this.createFailedLog(ReportType.DAILY, 'Daily report skipped because WhatsappClient is not connected.');
      return;
    }

    const existingLog = await this.hasDailyLog(timezone);
    if (existingLog) {
      console.log('[Scheduler Infrastructure] Daily report already logged for today; skipping duplicate trigger.');
      return;
    }

    try {
      await this.reportSender.sendDaily();
      console.log('[Scheduler Infrastructure] Daily report triggered successfully.');
    } catch (error: any) {
      await this.createFailedLog(ReportType.DAILY, `Daily report execution failed: ${error?.message || 'Unknown error'}`);
    }
  }

  private async handleClosingTrigger(setting: any, timezone: string) {
    const missingFields = [];
    if (!setting.opening_time) missingFields.push('opening_time');
    if (!setting.closing_time) missingFields.push('closing_time');
    if (setting.closing_day == null) missingFields.push('closing_day');

    if (missingFields.length > 0) {
      await this.createFailedLog(ReportType.CLOSING, `Closing report skipped because missing settings: ${missingFields.join(', ')}`);
      return;
    }

    const recipientCount = await prisma.reportRecipient.count({
      where: {
        is_active: true,
        report_type: { in: ['CLOSING', 'ALL'] },
      },
    });

    if (recipientCount === 0) {
      await this.createFailedLog(ReportType.CLOSING, 'Closing report skipped because no active recipients exist.');
      return;
    }

    const whatsappReady = await this.whatsappClient.checkStatus();
    if (!whatsappReady) {
      await this.createFailedLog(ReportType.CLOSING, 'Closing report skipped because WhatsappClient is not connected.');
      return;
    }

    const existingLog = await this.hasClosingLog(timezone);
    if (existingLog) {
      console.log('[Scheduler Infrastructure] Closing report already logged for this period; skipping duplicate trigger.');
      return;
    }

    try {
      await this.reportSender.sendClosing();
      console.log('[Scheduler Infrastructure] Closing report triggered successfully.');
    } catch (error: any) {
      await this.createFailedLog(ReportType.CLOSING, `Closing report execution failed: ${error?.message || 'Unknown error'}`);
    }
  }

  calculateNextExecutionTimes(cronExpression: string): Date[] {
    const now = new Date();
    const next1 = new Date(now.getTime() + 60 * 60 * 1000);
    const next2 = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    return [next1, next2];
  }
}

export default SchedulerService;
