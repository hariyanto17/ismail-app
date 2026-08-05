import { Request, Response, NextFunction } from 'express';
import { AnalyticsQueryService } from './services/AnalyticsQueryService';
import { AnalyticsRebuildService } from './services/AnalyticsRebuildService';
import { getWibDateString } from '../common/timezone';

const queryService = new AnalyticsQueryService();

export class AnalyticsController {
  getDailyAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let dateStr = req.query.date as string;
      if (!dateStr) {
        dateStr = getWibDateString();
      }
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dateStr)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Expected YYYY-MM-DD.',
        });
      }
      const result = await queryService.getDailyAnalytics(dateStr);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getMonthlyAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let monthParam = req.query.month;
      let yearParam = req.query.year;

      let month: number;
      let year: number;

      if (monthParam && yearParam) {
        month = parseInt(monthParam as string, 10);
        year = parseInt(yearParam as string, 10);
      } else {
        const todayStr = getWibDateString();
        const parts = todayStr.split('-');
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
      }

      if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
        return res.status(400).json({
          success: false,
          message: 'Invalid month or year parameters.',
        });
      }

      const result = await queryService.getMonthlyAnalytics(month, year);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  rebuildAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await AnalyticsRebuildService.rebuildAll();
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AnalyticsController;
