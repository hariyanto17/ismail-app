import { Request, Response } from 'express';
import { ReportRecipientService } from './service';
import { reportRecipientSchema } from './validation';

const service = new ReportRecipientService();

export class ReportRecipientController {
  async getAll(req: Request, res: Response) {
    try {
      const recipients = await service.getAll();
      return res.status(200).json({ success: true, data: recipients });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const validation = reportRecipientSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.error.format(),
        });
      }
      const recipient = await service.create(validation.data);
      return res.status(201).json({ success: true, data: recipient });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validation = reportRecipientSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.error.format(),
        });
      }
      const recipient = await service.update(id, validation.data);
      return res.status(200).json({ success: true, data: recipient });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await service.delete(id);
      return res.status(200).json({ success: true, message: 'Recipient deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
export default ReportRecipientController;
