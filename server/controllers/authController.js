import config from '../config/index.js';
import authService from '../services/authService.js';
import { logger } from '../utils/index.js';

const setCookieOptions = (res) => {
  return {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: config.env === 'production' ? 'strict' : 'lax',
    maxAge: config.jwt.cookieExpire * 24 * 60 * 60 * 1000,
  };
};

export const register = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.register(req.body);
    
    res.cookie('accessToken', accessToken, setCookieOptions(res));
    res.cookie('refreshToken', refreshToken, {
      ...setCookieOptions(res),
      path: '/api/v1/auth/refresh-token',
    });

    res.status(201).json({
      success: true,
      data: { user, accessToken },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login(email, password);

    res.cookie('accessToken', accessToken, setCookieOptions(res));
    res.cookie('refreshToken', refreshToken, {
      ...setCookieOptions(res),
      path: '/api/v1/auth/refresh-token',
    });

    res.status(200).json({
      success: true,
      data: { user, accessToken },
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user._id);
    
    res.cookie('accessToken', '', { expires: new Date(0), httpOnly: true });
    res.cookie('refreshToken', '', { expires: new Date(0), httpOnly: true, path: '/api/v1/auth/refresh-token' });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    const { accessToken, refreshToken: newRefreshToken } = await authService.refreshToken(refreshToken);

    res.cookie('accessToken', accessToken, setCookieOptions(res));
    res.cookie('refreshToken', newRefreshToken, {
      ...setCookieOptions(res),
      path: '/api/v1/auth/refresh-token',
    });

    res.status(200).json({
      success: true,
      data: { accessToken },
    });
  } catch (err) {
    next(err);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user._id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.user._id, req.body);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

export const requestPasswordReset = async (req, res, next) => {
  try {
    const resetToken = await authService.generateResetPasswordToken(req.body.email);
    // In production, send email with reset link here
    logger.info(`Password reset token for ${req.body.email}: ${resetToken}`);
    res.status(200).json({
      success: true,
      message: 'If this email exists, you will receive password reset instructions',
      // Only for development, remove in production
      ...(config.env === 'development' ? { resetToken } : {}),
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    await authService.resetPassword(req.params.token, req.body.password);
    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (err) {
    next(err);
  }
};

export const requestEmailVerification = async (req, res, next) => {
  try {
    const verificationToken = await authService.generateVerificationToken(req.user._id);
    // In production, send email with verification link here
    logger.info(`Email verification token for ${req.user.email}: ${verificationToken}`);
    res.status(200).json({
      success: true,
      message: 'Verification email sent',
      // Only for development, remove in production
      ...(config.env === 'development' ? { verificationToken } : {}),
    });
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    await authService.verifyEmail(req.params.token);
    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (err) {
    next(err);
  }
};

export default {
  register,
  login,
  logout,
  refreshToken,
  getCurrentUser,
  updateProfile,
  requestPasswordReset,
  resetPassword,
  requestEmailVerification,
  verifyEmail,
};
