import { Request, Response, NextFunction } from 'express';
import { ReportService } from './service';
import { ReportPreviewService } from './services/ReportPreviewService';
import { ReportSenderService } from './services/ReportSenderService';
import { getWibDateString } from '../common/timezone';

const reportService = new ReportService();
const previewService = new ReportPreviewService();
const senderService = new ReportSenderService();

export class ReportController {
  getDailyReport = async (req: Request, res: Response, next: NextFunction) => {
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
      const reportData = await reportService.getDailyReport(dateStr);
      res.status(200).json({
        success: true,
        data: reportData,
      });
    } catch (error) {
      next(error);
    }
  };

  previewDailyReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const message = await previewService.previewDaily();
      res.status(200).json({
        success: true,
        data: {
          reportType: 'DAILY',
          message,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  previewClosingReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const message = await previewService.previewClosing();
      res.status(200).json({
        success: true,
        data: {
          reportType: 'CLOSING',
          message,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  sendDailyReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await senderService.sendDaily();
      res.status(200).json(result);
    } catch (error: any) {
      if (error.message === 'WhatsApp is not connected') {
        return res.status(503).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  };

  sendClosingReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await senderService.sendClosing();
      res.status(200).json(result);
    } catch (error: any) {
      if (error.message === 'WhatsApp is not connected') {
        return res.status(503).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  };
}

export default ReportController;
