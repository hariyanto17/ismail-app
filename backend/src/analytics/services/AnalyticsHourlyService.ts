import prisma from '../../config/prisma';

export class AnalyticsHourlyService {
  async getHourlySummary(businessDate: string) {
    return prisma.analyticsHourly.findMany({
      where: { business_date: businessDate },
    });
  }
}

export default AnalyticsHourlyService;
