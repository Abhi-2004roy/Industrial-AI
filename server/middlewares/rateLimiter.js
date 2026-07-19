import rateLimit from 'express-rate-limit';
import config from '../config/index.js';

const createRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || config.rateLimit.windowMs,
    max: options.max || config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false },
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later',
    },
  });
};

export const generalLimiter = createRateLimiter();

export const strictLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
});

export default generalLimiter;
