import { Request, Response } from 'express';
import { AppSettingService } from './service';

const service = new AppSettingService();

export class AppSettingController {
  async get(req: Request, res: Response) {
    try {
      const setting = await service.getOrCreate();
      return res.status(200).json({ success: true, data: setting });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const {
        store_name,
        store_address,
        store_phone,
        instagram,
        opening_time,
        closing_time,
        closing_day,
        timezone,
        currency,
      } = req.body;

      const setting = await service.update({
        store_name,
        store_address,
        store_phone,
        instagram,
        opening_time,
        closing_time,
        closing_day: closing_day !== undefined ? Number(closing_day) : undefined,
        timezone,
        currency,
      });

      return res.status(200).json({ success: true, data: setting });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
export default AppSettingController;
