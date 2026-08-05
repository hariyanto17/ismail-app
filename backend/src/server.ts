import app from './app';
import { SettingCache } from './reports/cache/SettingCache';
import SchedulerService from './reports/scheduler/SchedulerService';

const PORT = process.env.PORT || 5001;

SettingCache.load()
  .then(() => {
    SchedulerService.getInstance().start().catch((err) => {
      console.error('Failed to start SchedulerService:', err);
    });

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize SettingCache on startup:', err);
    process.exit(1);
  });
