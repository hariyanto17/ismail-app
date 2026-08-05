import prisma from '../../config/prisma';

export class AnalyticsDailyService {
  async getDailySummary(businessDate: string) {
    return prisma.analyticsDaily.findUnique({
      where: { business_date: businessDate },
    });
  }
}

export default AnalyticsDailyService;
