import prisma from '../../config/prisma';
import { AnalyticsSummaryService } from './AnalyticsSummaryService';

export class AnalyticsRebuildService {
  static async rebuildAll() {
    return prisma.$transaction(async (tx) => {
      // 1. Clear existing summary tables
      await tx.analyticsProductDaily.deleteMany();
      await tx.analyticsHourly.deleteMany();
      await tx.analyticsDaily.deleteMany();

      // 2. Fetch all historical transactions in chronological order
      const transactions = await tx.transaction.findMany({
        orderBy: { created_at: 'asc' },
        include: {
          items: true,
        },
      });

      // 3. For each transaction, run updateSummary
      for (const txRecord of transactions) {
        await AnalyticsSummaryService.updateSummary(
          tx,
          {
            id: txRecord.id,
            created_at: txRecord.created_at,
            total: txRecord.total,
            payment_method: txRecord.payment_method,
          },
          txRecord.items
        );
      }

      return {
        success: true,
        rebuiltCount: transactions.length,
      };
    });
  }
}

export default AnalyticsRebuildService;
