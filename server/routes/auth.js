import express from 'express';
import { authController } from '../controllers/index.js';
import { protect, strictLimiter } from '../middlewares/index.js';
import {
  validate,
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateProfileValidation,
} from '../validators/index.js';
import { logActivity } from '../middlewares/index.js';

const router = express.Router();

router.post(
  '/register',
  strictLimiter,
  validate(registerValidation),
  logActivity({ action: 'register' }),
  authController.register
);

router.post(
  '/login',
  strictLimiter,
  validate(loginValidation),
  logActivity({ action: 'login' }),
  authController.login
);

router.post('/refresh-token', authController.refreshToken);

router.post(
  '/forgot-password',
  strictLimiter,
  validate(forgotPasswordValidation),
  authController.requestPasswordReset
);

router.post(
  '/reset-password/:token',
  strictLimiter,
  validate(resetPasswordValidation),
  authController.resetPassword
);

// Protected Routes
router.use(protect);

router.get('/me', authController.getCurrentUser);

router.put(
  '/me',
  validate(updateProfileValidation),
  logActivity({ action: 'update_profile' }),
  authController.updateProfile
);

router.post('/logout', authController.logout);

router.post(
  '/request-verification',
  logActivity({ action: 'request_email_verification' }),
  authController.requestEmailVerification
);

router.post('/verify-email/:token', authController.verifyEmail);

export default router;
