import { sendError } from '../utils/responseHelper.js';

export const notFoundHandler = (req, res, _next) => {
  return sendError(res, `Resource not found: ${req.method} ${req.originalUrl}`, 404);
};

export const errorHandler = (err, req, res, _next) => {
  console.error(`[Error] ${req.method} ${req.originalUrl} -`, err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((el) => ({
      field: el.path,
      message: el.message
    }));
    return sendError(res, 'Validation Error', 422, errors);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const val = err.keyValue ? err.keyValue[field] : '';
    return sendError(res, `Duplicate value '${val}' for unique field '${field}'`, 409);
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return sendError(res, `Invalid ID format for parameter '${err.path}'`, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid authentication token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Authentication token has expired', 401);
  }

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal server error occurred'
    : err.message || 'Internal server error';

  return sendError(res, message, statusCode);
};
