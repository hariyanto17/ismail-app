import { Request, Response } from 'express';
import { HealthService } from './service';

const service = new HealthService();

export class HealthController {
  async ping(req: Request, res: Response) {
    try {
      const data = await service.ping();
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async health(req: Request, res: Response) {
    try {
      const data = await service.checkHealth();
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      return res.status(503).json({
        success: false,
        data: {
          status: 'unhealthy',
          database: 'disconnected',
        },
      });
    }
  }
}
export default HealthController;
