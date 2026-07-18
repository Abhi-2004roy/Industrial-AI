import { NotFoundError } from '../utils/index.js';

export const notFound = (req, res, next) => {
  next(new NotFoundError(`Not Found - ${req.originalUrl}`));
};

export default notFound;
