import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
} from '../utils/index.js';
import config from '../config/index.js';
import UserRepository from '../repositories/UserRepository.js';
import { sanitizeUserForResponse } from '../utils/filePaths.js';
import { logger } from '../utils/index.js';

export const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
  const refreshToken = jwt.sign({ id: userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });

  return { accessToken, refreshToken };
};

export const register = async (userData) => {
  const { name, email, password } = userData;

  const existingUser = await UserRepository.findByEmail(email);
  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  const user = await UserRepository.create({
    name,
    email,
    password,
  });

  const { accessToken, refreshToken } = generateTokens(user._id);
  await UserRepository.updateRefreshToken(user._id, refreshToken);

  return {
    user: sanitizeUserForResponse(user),
    accessToken,
    refreshToken,
  };
};

export const login = async (email, password) => {
  console.log('[authService.login] Attempting login with email:', email);
  
  const user = await UserRepository.findByEmail(email);
  console.log('[authService.login] Found user:', user ? { _id: user._id, email: user.email } : null);

  if (!user) {
    console.log('[authService.login] No user found for email:', email);
    throw new UnauthorizedError('Invalid credentials');
  }

  const passwordMatch = await user.matchPassword(password);
  console.log('[authService.login] Password match:', passwordMatch);
  
  if (!passwordMatch) {
    console.log('[authService.login] Password mismatch for email:', email);
    throw new UnauthorizedError('Invalid credentials');
  }

  const { accessToken, refreshToken } = generateTokens(user._id);
  await UserRepository.updateRefreshToken(user._id, refreshToken);

  const sanitizedUser = sanitizeUserForResponse(user);
  console.log('[authService.login] Sanitized user:', sanitizedUser);

  return {
    user: sanitizedUser,
    accessToken,
    refreshToken,
  };
};

export const logout = async (userId) => {
  await UserRepository.updateRefreshToken(userId, null);
};

export const refreshToken = async (token) => {
  if (!token) {
    throw new UnauthorizedError('Refresh token is required');
  }

  const decoded = jwt.verify(token, config.jwt.refreshSecret);
  const user = await UserRepository.findByRefreshToken(token);

  if (!user || user._id.toString() !== decoded.id) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
  await UserRepository.updateRefreshToken(user._id, newRefreshToken);

  return { accessToken, refreshToken: newRefreshToken };
};

export const getCurrentUser = async (userId) => {
  const user = await UserRepository.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return sanitizeUserForResponse(user);
};

export const updateProfile = async (userId, updateData) => {
  const { email } = updateData;
  if (email) {
    const existingUser = await UserRepository.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      throw new ConflictError('Email already in use');
    }
  }

  const user = await UserRepository.updateById(userId, updateData);
  return sanitizeUserForResponse(user);
};

export const generateVerificationToken = async (userId) => {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  const emailVerificationExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  await UserRepository.updateById(userId, {
    emailVerificationToken,
    emailVerificationExpire,
  });

  return verificationToken;
};

export const verifyEmail = async (token) => {
  const emailVerificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await UserRepository.findOne({
    emailVerificationToken,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new BadRequestError('Invalid or expired verification token');
  }

  await UserRepository.updateById(user._id, {
    isEmailVerified: true,
    emailVerificationToken: undefined,
    emailVerificationExpire: undefined,
  });

  return { message: 'Email verified successfully' };
};

export const generateResetPasswordToken = async (email) => {
  const user = await UserRepository.findByEmail(email);
  if (!user) {
    throw new NotFoundError('User not found with this email');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  const resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  await UserRepository.updateById(user._id, {
    resetPasswordToken,
    resetPasswordExpire,
  });

  return resetToken;
};

export const resetPassword = async (token, newPassword) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await UserRepository.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new BadRequestError('Invalid or expired reset token');
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  return { message: 'Password reset successfully' };
};

export default {
  register,
  login,
  logout,
  refreshToken,
  getCurrentUser,
  updateProfile,
  generateVerificationToken,
  verifyEmail,
  generateResetPasswordToken,
  resetPassword,
};
