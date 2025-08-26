import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  env: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  pyIngestUrl: process.env.PY_INGEST_URL || 'http://localhost:8000',
  pyIngestApiKey: process.env.PY_API_KEY || 'secret',
}));