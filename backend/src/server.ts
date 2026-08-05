import app from './app';
import { SettingCache } from './reports/cache/SettingCache';

const PORT = process.env.PORT || 5001;

SettingCache.load()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize SettingCache on startup:', err);
    process.exit(1);
  });
