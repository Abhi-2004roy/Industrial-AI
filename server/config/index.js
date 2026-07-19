import dotenv from 'dotenv'

dotenv.config()

export default {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  // MongoDB
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/industrial-ai',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-keep-it-safe',
    expiresIn: process.env.JWT_EXPIRE || '30d',
    cookieExpire: parseInt(process.env.JWT_COOKIE_EXPIRE) || 30,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'your-super-secret-refresh-token-key',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRE || '7d',
  },

  // Google Gemini
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },

  // Email
  email: {
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || 'Industrial AI <no-reply@industrialai.com>',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per windowMs
  },

  uploadPath: process.env.UPLOAD_PATH || 'uploads',
};
