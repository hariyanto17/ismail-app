import prisma from '../../config/prisma';

export class AnalyticsProductService {
  async getProductSummary(businessDate: string) {
    return prisma.analyticsProductDaily.findMany({
      where: { business_date: businessDate },
      include: { product: true },
    });
  }
}

export default AnalyticsProductService;
