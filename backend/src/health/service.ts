import { performance } from 'perf_hooks';
import prisma from '../config/prisma';
import { getIsoStringWithOffset } from '../common/timezone';

export class HealthService {
  async ping() {
    const start = performance.now();
    const end = performance.now();
    return {
      message: 'pong',
      responseTimeMs: parseFloat((end - start).toFixed(4)),
    };
  }

  async checkHealth() {
    const startTime = performance.now();
    
    // Check PostgreSQL connection
    await prisma.$queryRaw`SELECT 1`;

    // Fetch dynamic timezone
    const setting = await prisma.appSetting.findFirst();
    const timezone = setting?.timezone || 'Asia/Makassar';

    const endTime = performance.now();

    return {
      status: 'healthy',
      database: 'connected',
      responseTimeMs: parseFloat((endTime - startTime).toFixed(4)),
      uptime: Math.floor(process.uptime()),
      version: '1.0.0',
      timestamp: getIsoStringWithOffset(new Date(), timezone),
    };
  }
}
export default HealthService;
