import { ReportType, ReportStatus } from '@prisma/client';
import prisma from '../../config/prisma';

export class ReportLogService {
  static async createLog(params: {
    reportType: ReportType;
    recipient: string;
    recipientName?: string;
    message: string;
    status: ReportStatus;
    errorMessage?: string;
    sentAt?: Date;
  }) {
    return prisma.reportLog.create({
      data: {
        report_type: params.reportType,
        recipient: params.recipient,
        recipient_name: params.recipientName,
        message: params.message,
        status: params.status,
        error_message: params.errorMessage,
        sent_at: params.sentAt,
      },
    });
  }
}

export default ReportLogService;
