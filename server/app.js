import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import config from './config/index.js';
import { logger } from './utils/index.js';
import {
  generalLimiter,
  errorHandler,
  notFound,
} from './middlewares/index.js';
import apiRouter from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust proxy for Vercel/Railway
app.set('trust proxy', true);

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS — allow local dev and deployed Vercel frontend
const allowedOrigins = [...new Set([config.clientUrl, 'http://localhost:5173', 'http://localhost:5174'].filter(Boolean))];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Logging
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Data Sanitization
app.use(xss());
app.use(mongoSanitize());

// Compression
app.use(compression());

// Rate Limiting
app.use('/api/', generalLimiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, config.uploadPath)));

// API Routes
app.use('/api/v1', apiRouter);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
