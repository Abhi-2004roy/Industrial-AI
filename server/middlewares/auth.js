import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError, NotFoundError } from '../utils/index.js';
import config from '../config/index.js';
import User from '../models/User.js';
import { USER_ROLES } from '../constants/index.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new UnauthorizedError('Not authorized to access this route'));
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new NotFoundError('User not found'));
    }
    req.user = user;
    next();
  } catch (err) {
    next(new UnauthorizedError('Not authorized to access this route'));
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError('Not authorized to access this route');
    }
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(`User role ${req.user.role} is not authorized to access this route`);
    }
    next();
  };
};

export const isAdmin = authorize(USER_ROLES.ADMIN);
export const isManagerOrAdmin = authorize(USER_ROLES.MANAGER, USER_ROLES.ADMIN);

export default protect;
